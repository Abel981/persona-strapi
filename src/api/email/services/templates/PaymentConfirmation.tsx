// emails/ResetPassword.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PaymentConfirmationEmailProps {
  amount: number;
  currency: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const PaymentConfirmationEmail = ({
  amount = 0,
  currency = "USD",
  email = "",
  firstName = "",
  lastName = "",
}: PaymentConfirmationEmailProps) => {
  const previewText = `Thank you for your donation`;
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Thank You for Your Donation!</Heading>

          <Section style={section}>
            <Text style={text}>
              Dear {firstName} {lastName},
            </Text>
            <Text style={text}>
              Thank you for your generous donation of {formattedAmount}. Your
              support means a lot to us and will help make a difference.
            </Text>

            <Text style={text}>
              Donation Details:
              <br />
              Amount: {formattedAmount}
              <br />
              Email: {email}
            </Text>

            <Text style={footer}>
              If you have any questions about your donation, please{" "}
              <Link href="mailto:support@yourdomain.com" style={link}>
                contact our support team
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  padding: "10px 0",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  borderRadius: "5px",
  margin: "0 auto",
  padding: "45px",
  maxWidth: "620px",
};

const heading = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "0 0 15px",
};

const section = {
  margin: "25px 0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "16px 0",
};

const link = {
  color: "#007bff",
  textDecoration: "underline",
};

const footer = {
  color: "#666",
  fontSize: "14px",
  margin: "45px 0 0",
};

export default PaymentConfirmationEmail;
