import "./SubscriptionSection.css";
import ContinueIcon from "./ContinueIcon.js";
import HSpacer from "./HSpacer";
import React, { useEffect, useState } from "react";
import SubscriptionDetailsCard from "./SubscriptionDetailsCard";
import { useNavigate } from "react-router-dom";

const color = "white";
const SubscriptionSection = () => {
  const [onHover, setOnHover] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState("starter");
  const [subscriptionPriceText, setSubscriptionPriceText] = useState("55");
  const [stripeSubscriptionPrice, setStripeSubscriptionPrice] = useState(5500); // why is stripeSubscriptionPrice never used, but it is set several times?
  const [stripePriceId, setStripePriceId] = useState(
    process.env.REACT_APP_STARTER_STRIPE_PRICE_ID
  );
  const navigate = useNavigate();

  useEffect(() => {
    // this switch could potentially be wrapped in it's own helper function and imported, naming suggestion: chooseSubscriptionType(). I could have suggested it be called setSubscriptionType() but since functions beginning with "set" are usually state functions, that could be misleading.
    switch (subscriptionType) {
      case "starter":
        setStripePriceId(process.env.REACT_APP_STARTER_STRIPE_PRICE_ID);
        break;
      case "intermediate":
        setStripePriceId(process.env.REACT_APP_INTERMEDIATE_STRIPE_PRICE_ID);
        break;
      case "advanced":
        setStripePriceId(process.env.REACT_APP_ADVANCED_STRIPE_PRICE_ID);
        break;
      default:
        setStripePriceId(process.env.REACT_APP_STARTER_STRIPE_PRICE_ID);
    }
  }, [subscriptionType]);

  const handleSubmit = () => {
    // this network call with fetch could be wrapped into it's own custom hook for example useStripeSubscription then when we update a subscription it could also be a hook named useUpdateStripeSubscription.
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId: stripePriceId,
      }),
    };

    fetch(
      `${process.env.REACT_APP_API_BASE_URL}/incomplete-subscriptions`,
      requestOptions
    )
      .then((res) => res.json())
      .then((data) => {
        navigate("/checkout", {
          state: {
            clientSecret: data.latest_invoice.payment_intent.client_secret,
            subscriptionType: subscriptionType,
            subscriptionPrice: subscriptionPriceText,
          },
        });
      })
      .catch((err) => console.log("error creating product:", err));
  };

  return (
    <div className="subscriptionSectionBackground">
      <div className="pageContents">
        <div className="header">Select Your Subscription</div>
        <div className="cards">
          <SubscriptionDetailsCard
            id={"starter"}
            selectedCardId={selectedCardId}
            subscriptionName="Starter"
            price={"55"}
            subscriptionDetails={[
              // this array of strings could potentially be defined as a variable and imported to save some room, we have this same pattern many times on this page.
              "Group classes with apprentice and intermediate instructors",
              "Weekly instructional videos",
              "Exclusive access to our online community of ikebana enthusiastsr",
              "Bi-weekly flower delivery",
              "Includes initial starter kit (kenzan, vase, scissors)",
              "Small group sessions with other advancing peers",
            ]}
            onClick={() => {
              setSelectedCardId("starter");
              setSubscriptionType("starter");
              setSubscriptionPriceText("55");
              setStripeSubscriptionPrice(5500);
            }}
          />
          <SubscriptionDetailsCard
            id={"intermediate"}
            selectedCardId={selectedCardId}
            subscriptionName="Intermediate"
            price={"115"}
            subscriptionDetails={[
              // this array could be a variable
              "Exclusive access to our online community of ikebana enthusiasts",
              "Weekly step-by-step video tutorials and instructional pamphlets",
              "Ikebana maintenance tips",
              "Includes initial starter kit (kenzen, vase, scissors)",
              "Syllabus of recommended readings",
            ]}
            onClick={() => {
              setSelectedCardId("intermediate");
              setSubscriptionType("intermediate");
              setSubscriptionPriceText("115");
              setStripeSubscriptionPrice(11500);
            }}
          />
          <SubscriptionDetailsCard
            id={"advanced"}
            selectedCardId={selectedCardId}
            subscriptionName="Advanced"
            price={"205"}
            subscriptionDetails={[
              // this array could be a variable
              "Zoom one-on-one sessions with a Master",
              "Monthly instructional videos, advanced techniques from a Master",
              "Invitations to annual ikebana events and competitions",
              "Weekly flower delivery and Seasonal themed vases",
              "Exclusive access to our online community of ikebana enthusiasts",
              "Includes everything from starter and intermediate",
            ]}
            onClick={() => {
              setSelectedCardId("advanced");
              setSubscriptionType("advanced");
              setSubscriptionPriceText("205");
              setStripeSubscriptionPrice(20500);
            }}
          />
        </div>
        <button
          aria-label="submit a subscription type"
          role="button"
          onMouseEnter={() => setOnHover(true)}
          onMouseLeave={() => setOnHover(false)}
          className="button"
          onClick={() => handleSubmit()}
        >
          Select a Subscription Type
          <HSpacer />
          <ContinueIcon color={onHover ? "#e4987c" : color} />
        </button>
        <div className="footer" />
      </div>
    </div>
  );
};

export default SubscriptionSection;
