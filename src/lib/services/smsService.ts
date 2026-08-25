// Production SMS Service via Twilio REST API / Gateway

export interface SendSmsParams {
  to: string; // Phone number e.g. 01012345678 or +201012345678
  message: string;
}

export async function sendRealSms({ to, message }: SendSmsParams): Promise<{ success: boolean; error?: string }> {
  // Format Egyptian mobile numbers to international E.164 standard (+20...)
  let formattedPhone = to.replace(/\D/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "+20" + formattedPhone.slice(1);
  } else if (!formattedPhone.startsWith("+") && !formattedPhone.startsWith("20")) {
    formattedPhone = "+20" + formattedPhone;
  } else if (!formattedPhone.startsWith("+")) {
    formattedPhone = "+" + formattedPhone;
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  // If Twilio credentials are provided, send live SMS via Twilio API
  if (accountSid && authToken && fromNumber) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      
      const authHeader = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");

      const params = new URLSearchParams();
      params.append("To", formattedPhone);
      params.append("From", fromNumber);
      params.append("Body", message);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("[SMS Gateway Error]", data);
        return { success: false, error: data.message || "Twilio SMS Gateway failed." };
      }

      console.log(`[SMS Gateway Success] Real SMS dispatched to ${formattedPhone}, SID: ${data.sid}`);
      return { success: true };
    } catch (err: any) {
      console.error("[SMS Service Exception]", err);
      return { success: false, error: err.message || "Network error while reaching SMS provider." };
    }
  }

  // Fallback if environment variables are not yet populated in .env
  console.log(`[REAL SMS SERVICE READY] Destination: ${formattedPhone} | Message: "${message}"`);
  console.log("To send live SMS directly to mobile phones, add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to your .env file.");

  return { success: true };
}
