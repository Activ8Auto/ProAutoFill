"use client";
import { Typography, Box } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

const FAQ = () => {
  return (
    <PageContainer
      title="How to Use AutoFillPro"
      description="Get started quickly with AutoFillPro by following these frequently asked questions."
    >
      <DashboardCard title="AutoFillPro FAQ">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Typography variant="h6"> What is AutoFillPro?</Typography>
          <Typography>
            <strong>AutoFillPro</strong> is a smart automation tool that fills
            out Medtrics web forms for you based on your saved profile. Just set
            up your details once, and AutoFillPro will handle the repetitive
            form-filling—accurately and in seconds.
          </Typography>

          <Typography variant="h6"> How do I get started?</Typography>
          <Typography component="div">
            <ol>
              <li>
                <strong>Set up your profile:</strong> Navigate to the “My
                Profile” tab and enter details like rotation type, visit
                duration, diagnoses, etc.
              </li>
              <li>
                <strong>Customize your diagnosis library:</strong> Add commonly
                used diagnoses for easy reuse.
              </li>
              <li>
                <strong>Trigger automation:</strong> Go to the Dashboard and
                click “Medtrics Automation”. Fill out a profile form to have
                ready. Then, at the bottom, select the profile and click run to
                have the forms auto-filled for you.
              </li>
            </ol>
          </Typography>

          <Typography variant="h6"> Is my data secure?</Typography>
          <Typography>
            Yes. All your data is encrypted and stored securely. Your login info
            is never exposed—only used in a secure environment for automation.
          </Typography>

          <Typography variant="h6"> How many runs do I get?</Typography>
          <Typography>
            Free users get <strong>10 automation runs</strong> total. Paid users
            have <strong>unlimited runs</strong> and bonus analytics features.
          </Typography>

          <Typography variant="h6"> What’s a “Diagnosis Entry”?</Typography>
          <Typography>
            A reusable diagnosis template that includes ICD code, labs, physical
            exams, medications, teaching points, and exclusions. When running
            the program, 1–3 diagnoses will be picked at random. Filling out a
            Diagnosis Entry ensures that the auto-filled fields match the
            selected options logically and accurately.
          </Typography>

          <Typography variant="h6">What is "Exclusion Criteria"?</Typography>
          <Typography>
            Exclusion criteria are used to prevent contradictory or conflicting
            options from being selected together during automation. When two
            diagnoses or items fall into the same exclusion group, selecting one
            will automatically disable or deselect the others. This ensures
            clinical accuracy and prevents inappropriate combinations—like
            assigning both stimulant and mood stabilizer medications when they
            shouldn't be used together.
            <br />
          </Typography>
          <Box ml={4} mt={1}>
            <Typography variant="h6">What They Do</Typography>

            <Typography>
              They group mutually exclusive items so that: When one item in a
              group is selected, others from the same group are either: <br />
              <Box ml={4} mt={1}>
                ❌ Automatically deselected, or <br />
                🚫 Disabled to prevent selection.
              </Box>
            </Typography>
          </Box>
          <Box ml={4} mt={1}>
            <Typography variant="h6">Example:</Typography>
            <Typography>
              You want multiple different ADHD Diagnosis created so it doesn't
              always list the same medication in the charting.
              <Box ml={4} mt={1}>
                <u>Diagnosis A</u>: ADHD1
                <Box ml={4} mt={1}>
                  {" "}
                  <u>Medication</u>: Vyvanse 30mg{" "}
                </Box>
                <br />
                <u> Diagnosis B</u>: ADHD2
                <Box ml={4} mt={1}>
                  {" "}
                  <u>Medication</u>: Dextroamphetamine-amphetamine 20 mg
                </Box>{" "}
              </Box>
              <br />
              You Label Both With Exclusion Group: <u>ADHD!</u> <br /> <br />
              When picking the diagnosis--and there are up to 3 different
              diagnosis selected in any given run--it will not combine the two
              ADHD Diagonsis together because they are tied with the ADHD
              exclusion group.
            </Typography>
          </Box>
          <Typography variant="h6">
            Does it just rapidly fill out each one and make it look like a computer is doing it? Wont my teacher get mad?
          </Typography>
          <Typography>
            No! It fills out the page, waits for 45 seconds to 2 minutes, then does the next one. Our team has determined this is the average time it takes for people to fill out a form.
          </Typography>
          <Typography variant="h6">
            What is "Target Hours"
          </Typography>
          <Typography>
           How many hours you want it to chart for the day. By default: Follow Ups (30 minutes) are choosen 80% of the time versus 20% for New Admits (1 hour). It will run (with delays between runs) until the target hours is reached.
          </Typography>
          <Typography variant="h6">
            How do you handle 2 factor authentication??
          </Typography>
          <Typography>
           Every time you trigger the form filler, it will ask you to do the 2 factor authentication. If you do not do this it can't run. To be clear, if you schedulded the filler for a 10 hours run, you'd only have to 2 factor one time. 
          </Typography>
          <Typography variant="h6">
            Can I adjust what gets filled in each run?
          </Typography>
          <Typography>
            Yes! Each profile lets you customize things like visit duration,
            student function %, and more.
          </Typography>

          <Typography variant="h6">What if my rotation changes?</Typography>
          <Typography>
            Just update your profile or create a new one. You can switch between
            them anytime.
          </Typography>

          <Typography variant="h6"> Who can use this?</Typography>
          <Typography>
            AutoFillPro is built for NP students, clinical rotation programs,
            instructors, and anyone tired of filling out the same clinical data
            repeatedly.
          </Typography>

          
          <Typography variant="h6">
            How will I know if it's completed?
          </Typography>
          <Typography>
            Your dashboard will show detailed information after all the runs are
            finished as to what was successful!
          </Typography>
          <Typography variant="h6">
            If something goes wrong how will I know?
          </Typography>
          <Typography>
            You can either check the bell icon at the top or click on errors on
            the sidebar to see all errors from previous runs.
          </Typography>

          <Typography variant="h6"> Still have questions?</Typography>
          <Typography>
            We’re here to help. Email us at{" "}
            <strong>support@auto-fill-pro.pro</strong> We are extremely responsive.
            
          </Typography>
        </Box>
      </DashboardCard>
    </PageContainer>
  );
};

export default FAQ;
