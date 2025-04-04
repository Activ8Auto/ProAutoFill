from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError
import asyncio
import random
import logging

user_data_dir = "/tmp/playwright-user-data"

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

MAX_RETRIES = 3  # Maximum number of full script retries
browser_context = None
playwright_instance = None

# Define the custom exception here
class UserFixableError(Exception):
    """Exception raised for errors that the user can fix, like incorrect input values."""
    pass

def select_random_diagnoses(diagnoses, max_diagnoses=3):
    """
    Select random diagnoses, respecting exclusion groups.
    Returns a list of (diag_name, diag_info) tuples.
    """
    logger.info("Selecting random diagnoses...")
    selected_diagnoses = []
    seen_groups = set()
    shuffled_diagnoses = list(diagnoses.items())
    random.shuffle(shuffled_diagnoses)

    for diag_name, diag_info in shuffled_diagnoses:
        groups = diag_info.get("exclusion_group")
        if groups:
            if isinstance(groups, str):
                groups = [groups]
            if any(group in seen_groups for group in groups):
                continue

        selected_diagnoses.append((diag_name, diag_info))
        if groups:
            seen_groups.update(groups)

        if len(selected_diagnoses) >= max_diagnoses:
            break

    logger.info(f"Diagnoses selected: {[name for name, _ in selected_diagnoses]}")
    return selected_diagnoses

async def auto_sign_in(page, d_number, password):
    """Handle login using provided credentials and navigate to the target page after login."""
    try:
        locator_count = await page.locator("a.btn.btn-danger[href='/sso/login/saml/?idp=cu']").count()
        if locator_count > 0:
            logger.info("Entering login process: Redirecting to login page...")
            await page.click("a.btn.btn-danger[href='/sso/login/saml/?idp=cu']")
            logger.info("Filling username field")
            await page.fill("input[name='identifier']", d_number)
            await page.wait_for_timeout(1000)

            logger.info("Filling password field")
            await page.fill("input[name='credentials.passcode']", password)
            await page.click("input.button.button-primary[type='submit']")
            await page.wait_for_timeout(1000)

            logger.info("Selecting factor for Okta Verify push notification")
            await page.click(
                "a.button.select-factor.link-button[aria-label='Select to get a push notification to the Okta Verify app.']"
            )
            await page.click("input.button.button-primary[type='submit'][value='Send push']")
            await page.wait_for_timeout(2000)

            if "dashboard" in page.url or "home" in page.url:
                logger.info("✅ Successfully logged in!")
                await page.goto("https://cu.medtricslab.com/cases/create/14/")
            else:
                logger.warning("⚠️ Login might have failed or was unnecessary.")
        else:
            logger.info("🔓 No login page detected. Continuing...")
    except PlaywrightTimeoutError as e:
        if "waiting for locator" in str(e):
            raise UserFixableError("Login page elements not found. Check your credentials or site availability.")
        raise
    except Exception as e:
        logger.error(f"❌ Error in auto-sign-in: {e}")
        raise

async def select_preceptor(page, preceptor):
    """
    Select the preceptor from the dropdown, retrying if needed.
    Returns True on success, False on failure.
    """
    MAX_PRECEPTOR_RETRIES = 1
    for attempt in range(MAX_PRECEPTOR_RETRIES):
        try:
            logger.info(f"Entering Preceptor field (Attempt {attempt + 1}/{MAX_PRECEPTOR_RETRIES})...")
            await page.locator(".vue-treeselect__multi-value").nth(0).click()
            await page.wait_for_timeout(1000)

            logger.info(f"Selecting preceptor: {preceptor}")
            await page.click(f"text='{preceptor}'")
            logger.info("✅ Preceptor selected successfully!")
            return True

        except PlaywrightTimeoutError as e:
            if "waiting for locator" in str(e):
                raise UserFixableError(f"Preceptor '{preceptor}' not found in the dropdown. Please verify the preceptor name.")
            logger.error(f"❌ Preceptor selection failed: {e}")
            if attempt < MAX_PRECEPTOR_RETRIES - 1:
                logger.info("🔄 Refreshing page and retrying preceptor selection...")
                await page.reload()
                await page.wait_for_timeout(1000)
            else:
                logger.error("🚨 Max preceptor retries reached.")
                return False
        except Exception as e:
            logger.error(f"❌ Preceptor selection failed: {e}")
            return False

async def run_automation(profile_data, run_id=None):
    """
    Run the automation using data from profile_data.
    Optionally accepts run_id for partial DB updates (if desired).
    Returns a dictionary of final picks on success. Raises an exception on failure.
    """
    global browser_context, playwright_instance
    logger.info(f"Profile data received for run_id={run_id}: {profile_data}")

    final_picks = {
        "random_duration": None,
        "random_visit_type": None,
        "random_age": None,
        "random_gender": None,
        "random_race": None,
        "student_function": None,
        "complexity": None,
        "selected_diagnoses": [],
        "all_medications": [],
        "all_prescribed_meds": []
    }

    diagnoses = profile_data.get("diagnoses", {})

    for attempt in range(MAX_RETRIES):
        try:
            logger.info(f"🔄 Full Script Attempt {attempt + 1}/{MAX_RETRIES}...")
            if not playwright_instance:
                playwright_instance = await async_playwright().start()
                logger.info("Playwright instance started.")

            if browser_context:
                logger.info("Closing existing browser context...")
                await browser_context.close()
                browser_context = None

            logger.info("Launching new persistent browser context...")
            browser_context = await playwright_instance.chromium.launch_persistent_context(
                user_data_dir,
                channel="chromium",
                headless=True,
                args=[
                    "--window-position=0,0",
                    "--window-size=2560,1440",
                    "--force-device-scale-factor=1",
                    "--disable-features=CalculateNativeWinOcclusion"
                ]
            )
            page = await browser_context.new_page()
            page.set_default_navigation_timeout(10000)
            await page.set_viewport_size({"width": 2560, "height": 1440})

            logger.info("Navigating to the case creation page...")
            await page.goto("https://cu.medtricslab.com/cases/create/14/")

            logger.info("Starting auto sign-in...")
            await auto_sign_in(page, profile_data["dNumber"], profile_data["chamberlainPassword"])
            await page.wait_for_timeout(2000)

            # Date field
            logger.info("Entering Date field...")
            day_str = profile_data["selected_date"].split("-")[-1].lstrip("0")
            await page.click("input[placeholder='Case Date']")
            try:
                await page.click(f"text='{day_str}'")
            except PlaywrightTimeoutError:
                raise UserFixableError(f"Date '{day_str}' not available in the calendar. Please check the selected date.")
            await page.wait_for_timeout(1000)

            # Scheduled Rotation field
            logger.info("Entering Scheduled Rotation field...")
            await page.locator(".vue-treeselect__input").nth(0).click()
            await page.wait_for_timeout(500)
            try:
                await page.click(f"text='{profile_data['rotation']}'")
            except PlaywrightTimeoutError:
                raise UserFixableError(f"Rotation '{profile_data['rotation']}' not found. Please verify the rotation name.")
            await page.wait_for_timeout(500)

            # Faculty Preceptor field
            logger.info("Entering Faculty Preceptor field...")
            await page.click(
                'xpath=//*[@id="content"]/div[2]/div/div/div[2]/div/div[2]/div[1]/div/div/div[1]/div[1]/div[2]/input'
            )
            try:
                await page.click(f"text='{profile_data['faculty']}'")
            except PlaywrightTimeoutError:
                raise UserFixableError(f"Faculty '{profile_data['faculty']}' not found. Please verify the faculty name.")
            await page.wait_for_timeout(500)

            # Duration + Visit Type
            logger.info("Entering Duration and Visit Type field...")
            duration_options = profile_data["durationOptions"]
            duration_weights = profile_data["durationWeights"]
            random_duration = random.choices(duration_options, weights=duration_weights, k=1)[0]
            final_picks["random_duration"] = random_duration
            if "hour" in random_duration.lower():
                random_visit_type = "New Client Encounter"
            else:
                random_visit_type = "Follow up Client Encounter"
            final_picks["random_visit_type"] = random_visit_type

            await page.click(
                'xpath=//*[@id="content"]/div[2]/div/div/div[2]/div/div[2]/div[2]/div/div[1]/div[1]/div[2]/input'
            )
            await page.wait_for_selector(f"text='{random_duration}'")
            await page.wait_for_timeout(500)
            try:
                await page.click(f"text='{random_duration}'")
            except PlaywrightTimeoutError:
                raise UserFixableError(f"Duration '{random_duration}' not found. Please verify duration options.")
            logger.info(f"Duration selected: {random_duration}")

            # Preceptor Selection
            logger.info("Entering Preceptor Selection field...")
            if not await select_preceptor(page, profile_data["preceptor"]):
                logger.error("🚨 Preceptor selection failed after retries.")
                raise UserFixableError(f"Preceptor '{profile_data['preceptor']}' could not be selected after retries.")

            # Diagnosis field
            logger.info("Entering Diagnosis field...")
            max_diagnoses = profile_data.get("maxDiagnoses", random.randint(1, 3))
            selected_diagnoses = select_random_diagnoses(diagnoses, max_diagnoses=max_diagnoses)
            await page.locator(".vue-treeselect__multi-value").nth(1).click()

            dropdown = page.locator(".vue-treeselect--open")
            for diag_name, diag_info in selected_diagnoses:
                icd_code = diag_info["icd_code"]
                await dropdown.locator(".vue-treeselect__input").fill(icd_code)
                await page.wait_for_timeout(500)
                try:
                    await dropdown.locator(".vue-treeselect__option", has_text=icd_code).click()
                except PlaywrightTimeoutError:
                    raise UserFixableError(f"Diagnosis ICD code '{icd_code}' not found. Please verify the diagnosis.")
                await page.wait_for_timeout(500)

            final_picks["selected_diagnoses"] = [
                {"name": name, "icd_code": info["icd_code"]} for name, info in selected_diagnoses
            ]
            await page.click("body")

            # Physical Exam field
            logger.info("Entering Physical Exam field...")
            await page.locator(".vue-treeselect__multi-value").nth(3).click()
            await page.wait_for_timeout(500)
            await page.click("text='N/A'")
            await page.click("body")

            # Current Medications field
            logger.info("Entering Current Medications field...")
            all_medications = set()
            for _, diag_info in selected_diagnoses:
                meds = diag_info.get("current_medications", [])
                all_medications.update(meds)
            all_medications = list(all_medications)
            final_picks["all_medications"] = all_medications

            currentMedDropdowns = page.locator(".vue-treeselect__multi-value")
            if await currentMedDropdowns.count() > 5:
                await currentMedDropdowns.nth(5).click()
                await page.wait_for_timeout(500)
                if all_medications:
                    logger.info(f"Medications to Select: {all_medications}")
                    dropdown = page.locator(".vue-treeselect--open")
                    for med in all_medications:
                        await dropdown.locator(".vue-treeselect__input").fill(med)
                        await page.wait_for_timeout(500)
                        option = dropdown.locator(".vue-treeselect__option", has_text=med)
                        if await option.count() > 0:
                            await option.click()
                        else:
                            logger.warning(f"⚠️ Option not found for medication: {med}")
                        await page.wait_for_timeout(300)
            else:
                logger.error("❌ Could not find current medications dropdown.")

            # Student Prescribed Meds field
            logger.info("Entering Student Prescribed Meds field...")
            await page.locator(".vue-treeselect__multi-value").nth(6).click()
            await page.wait_for_timeout(500)
            meds_dropdown = page.locator(".vue-treeselect--open")
            await meds_dropdown.locator(".vue-treeselect__input").fill("N/A")
            await page.wait_for_timeout(500)
            await meds_dropdown.locator(".vue-treeselect__option", has_text="N/A").click()
            await page.click("body")

            # Teaching/Support by Student field
            logger.info("Entering Teaching/Support by Student field...")
            await page.locator(".vue-treeselect__multi-value").nth(9).click()
            await page.wait_for_timeout(500)
            await page.click("text='Medication Education and Management'")
            await page.click("body")

            # Age field
            logger.info("Entering Age field...")
            age_ranges = profile_data.get("age_ranges", [])
            if not age_ranges:
                logger.error("❌ No age ranges found in profile_data!")
                raise UserFixableError("No age ranges provided. Please specify valid age ranges.")
            else:
                ages = [ar["range"] for ar in age_ranges]
                weights = [ar["weight"] for ar in age_ranges]
                random_age = random.choices(ages, weights=weights, k=1)[0]
                final_picks["random_age"] = random_age

                await page.locator(".vue-treeselect--single").nth(3).click()
                await page.wait_for_timeout(500)
                try:
                    await page.click(f"text='{random_age}'")
                except PlaywrightTimeoutError:
                    raise UserFixableError(f"Age range '{random_age}' not found. Please verify the age ranges.")
                await page.click("body")
                logger.info(f"Age Range selected: {random_age}")

            # Gender field
            logger.info("Entering Gender field...")
            genders = profile_data.get("gender", [])
            if not genders:
                logger.error("❌ No gender options found in profile_data!")
                raise UserFixableError("No gender options provided. Please specify valid gender options.")
            gender_options = [g["gender"] for g in genders]
            gender_weights = [g["weight"] for g in genders]
            random_gender = random.choices(gender_options, weights=gender_weights, k=1)[0]
            final_picks["random_gender"] = random_gender

            await page.locator(".vue-treeselect__multi-value").nth(11).click()
            await page.wait_for_timeout(500)
            try:
                await page.click(f"text='{random_gender}'")
            except PlaywrightTimeoutError:
                raise UserFixableError(f"Gender '{random_gender}' not found. Please verify the gender options.")
            await page.click("body")
            logger.info(f"Gender selected: {random_gender}")

            # Race field
            logger.info("Entering Race field...")
            races = profile_data.get("race", [])
            if not races:
                logger.error("❌ No race options found in profile_data!")
                raise UserFixableError("No race options provided. Please specify valid race options.")
            race_options = [r["race"] for r in races]
            race_weights = [r["weight"] for r in races]
            random_race = random.choices(race_options, weights=race_weights, k=1)[0]
            final_picks["random_race"] = random_race

            await page.locator(".vue-treeselect--single").nth(4).click()
            await page.wait_for_timeout(500)
            try:
                await page.click(f"text='{random_race}'")
            except PlaywrightTimeoutError:
                raise UserFixableError(f"Race '{random_race}' not found. Please verify the race options.")
            await page.click("body")
            logger.info(f"Race selected: {random_race}")

            # Medications Textarea field
            logger.info("Entering Medications Textarea field...")
            all_prescribed_meds = set()
            for _, diag_info in selected_diagnoses:
                all_prescribed_meds.update(diag_info.get("medications", []))
            all_prescribed_meds = list(all_prescribed_meds)
            final_picks["all_prescribed_meds"] = all_prescribed_meds

            prescribed_meds_str = "; ".join(all_prescribed_meds)
            logger.info(f"Medications Entered: {prescribed_meds_str}")
            await page.fill("textarea.form-control", prescribed_meds_str)
            await page.wait_for_timeout(500)

            # Visit Mode field
            logger.info("Entering Visit Mode field...")
            visit_mode = profile_data.get("visitMode", "Face to Face")
            await page.locator(".vue-treeselect--single").nth(5).click()
            await page.wait_for_timeout(500)
            try:
                await page.click(f"text='{visit_mode}'")
            except PlaywrightTimeoutError:
                raise UserFixableError(f"Visit mode '{visit_mode}' not found. Please verify the visit mode.")
            await page.click("body")
            logger.info(f"Visit Mode selected: {visit_mode}")

            # Site Type field
            logger.info("Entering Site Type field...")
            site_type = profile_data.get("siteType")
            if not site_type:
                logger.error("❌ No site type provided in profile_data!")
                raise UserFixableError("No site type provided. Please specify a valid site type.")
            await page.locator(".vue-treeselect--single").nth(6).click()
            await page.wait_for_timeout(500)
            try:
                await page.click(f"text='{site_type}'")
            except PlaywrightTimeoutError:
                raise UserFixableError(f"Site type '{site_type}' not found. Please verify the site type.")
            await page.click("body")
            logger.info(f"Site Type selected: {site_type}")

            # Encounter Type field
            logger.info("Entering Encounter Type field...")
            await page.locator(".vue-treeselect--single").nth(7).click()
            await page.wait_for_timeout(500)
            try:
                await page.click(f"text='{random_visit_type}'")
            except PlaywrightTimeoutError:
                raise UserFixableError(f"Encounter type '{random_visit_type}' not found. Please verify the encounter type.")
            await page.click("body")
            logger.info(f"Encounter Type selected: {random_visit_type}")

            # Site Location field
            logger.info("Entering Site Location field...")
            site_location = profile_data.get("siteLocation")
            if not site_location:
                logger.error("❌ No site location provided in profile_data!")
                raise UserFixableError("No site location provided. Please specify a valid site location.")
            await page.locator(".vue-treeselect--single").nth(8).click()
            await page.wait_for_timeout(500)
            try:
                await page.click(f"text='{site_location}'")
            except PlaywrightTimeoutError:
                raise UserFixableError(f"Site location '{site_location}' not found. Please verify the site location.")
            await page.click("body")
            logger.info(f"Site Location selected: {site_location}")

            # CPT Visit Code field
            logger.info("Entering CPT Visit Code field...")
            cpt_code = profile_data.get("cptCode")
            if not cpt_code:
                logger.error("❌ No CPT code provided in profile_data!")
                raise UserFixableError("No CPT code provided. Please specify a valid CPT code.")
            await page.locator("input.form-control").nth(13).fill(cpt_code)
            await page.wait_for_timeout(500)

            # Student Level of Function field
            logger.info("Entering Student Level of Function field...")
            student_functions = profile_data.get("student_function_weights", [])
            if not student_functions:
                logger.error("❌ No student function weights provided in profile_data!")
                raise UserFixableError("No student function levels provided. Please specify valid levels.")
            student_function = student_functions[0]["level"]  # Assuming first level for simplicity
            final_picks["student_function"] = student_function

            await page.locator(".vue-treeselect--single").nth(10).click()
            await page.wait_for_timeout(500)
            try:
                await page.click(f"text='{student_function}'")
            except PlaywrightTimeoutError:
                raise UserFixableError(f"Student function level '{student_function}' not found. Please verify the level.")
            await page.click("body")
            logger.info(f"Student Function selected: {student_function}")

            # Client Complexity field
            logger.info("Entering Client Complexity field...")
            complexities = profile_data.get("complexity", [])
            if not complexities:
                logger.error("❌ No complexity levels provided in profile_data!")
                raise UserFixableError("No complexity levels provided. Please specify valid complexity levels.")
            complexity = complexities[0]["level"]  # Assuming first level for simplicity
            final_picks["complexity"] = complexity

            await page.locator(".vue-treeselect--single").nth(9).click()
            await page.wait_for_timeout(500)
            try:
                await page.click(f"text='{complexity}'")
            except PlaywrightTimeoutError:
                raise UserFixableError(f"Complexity level '{complexity}' not found. Please verify the complexity level.")
            await page.click("body")
            logger.info(f"Complexity selected: {complexity}")


            page.click("//button[contains(@class, 'btn-primary') and contains(text(), 'Save')]")
           
            logger.info("✅ Automation run completed successfully!")
            return final_picks

        except UserFixableError as e:
            logger.error(f"❌ User-fixable error during attempt {attempt + 1}: {e}")
            if browser_context:
                await browser_context.close()
                browser_context = None
            raise  # Raise immediately to stop retries and notify the user
        except Exception as e:
            logger.error(f"❌ Error during attempt {attempt + 1}: {e}")
            if browser_context:
                await browser_context.close()
                browser_context = None
            if attempt == MAX_RETRIES - 1:
                logger.error("🚨 Max retries reached. Exiting...")
                raise
            logger.info("🔄 Restarting full script...")

async def cancel_automation():
    """
    Clean up browser and playwright instances.
    """
    global browser_context, playwright_instance
    if browser_context:
        await browser_context.close()
        browser_context = None
        logger.info("Browser context closed.")

    if playwright_instance:
        await playwright_instance.stop()
        playwright_instance = None
        logger.info("Playwright instance stopped.")