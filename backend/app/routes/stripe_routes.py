# backend/app/routes/stripe_routes.py
import os
import logging
import stripe
from fastapi import APIRouter, HTTPException, Request, Depends
from tortoise.exceptions import DoesNotExist
from app.models.models import User
from app.auth import current_active_user  # or however you get the current user
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/stripe", tags=["Stripe"])

# Read environment variables
STRIPE_API_KEY = os.getenv("STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
SUCCESS_URL = os.getenv("STRIPE_SUCCESS_URL")
CANCEL_URL = os.getenv("STRIPE_CANCEL_URL")
PRICE_ID = os.getenv("STRIPE_PRICE_ID")

# Initialize Stripe with our secret
stripe.api_key = STRIPE_API_KEY

@router.post("/create-checkout-session")
async def create_checkout_session(
    current_user: User = Depends(current_active_user), 
):
    """
    Creates a Stripe Checkout session for a recurring subscription.
    If the user doesn't have a stripe_customer_id, create a Customer in Stripe first.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # If user has no stripe customer in profile_info, create one
    stripe_customer_id = None
    if current_user.profile_info:
        stripe_customer_id = current_user.profile_info.get("stripe_customer_id")

    if not stripe_customer_id:
        # Create a new Stripe Customer
        customer = stripe.Customer.create(
            email=current_user.email,
        )
        stripe_customer_id = customer["id"]

        # Save that to user.profile_info
        if not current_user.profile_info:
            current_user.profile_info = {}
        current_user.profile_info["stripe_customer_id"] = stripe_customer_id
        await current_user.save()

    # Create the checkout session
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            customer=stripe_customer_id,
            mode="subscription",
            line_items=[
                {
                    "price": PRICE_ID,
                    "quantity": 1,
                }
            ],
            success_url=SUCCESS_URL,
            cancel_url=CANCEL_URL,
        )
    except Exception as e:
        logging.error(f"Error creating checkout session: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    return {"checkout_url": session["url"]}


@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        logging.warning("Invalid Stripe signature.")
        raise HTTPException(status_code=400, detail="Invalid signature")

    logging.info(f"[Webhook] Event type: {event['type']}")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        customer_id = session.get("customer")

        logging.info(f"[Webhook] Handling checkout.session.completed for customer_id: {customer_id}")

        try:
            # Replace the broken line with:
            users = await User.all()

            user = None
            for u in users:
                if u.profile_info and u.profile_info.get("stripe_customer_id") == customer_id:
                    user = u
                    break
                
            if user:
                logging.info(f"[Webhook] Found user: {user.email}")
                user.is_paid_user = True
                await user.save()
                logging.info(f"[Webhook] User {user.id} marked as paid")
            else:
                logging.warning(f"[Webhook] No user found with stripe_customer_id: {customer_id}")

            if user:
                logging.info(f"[Webhook] Found user: {user.email}")
                user.is_paid_user = True
                await user.save()
                logging.info(f"[Webhook] User {user.id} marked as paid")
            else:
                logging.warning(f"[Webhook] No user found with stripe_customer_id: {customer_id}")
        except Exception as e:
            logging.error(f"[Webhook] Exception while updating user: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    else:
        logging.info(f"[Webhook] Ignored event type: {event['type']}")

    return JSONResponse({"status": "success"}, status_code=200)

