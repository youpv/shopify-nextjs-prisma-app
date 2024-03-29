import useFetch from "@/components/hooks/useFetch";
import { Button, Card, DataTable, Layout, Page, InlineStack } from "@shopify/polaris";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const BillingAPI = () => {
  const router = useRouter();
  const fetch = useFetch();
  const [responseData, setResponseData] = useState("");

  async function fetchContent() {
    setResponseData("loading...");
    const res = await fetch("/api/apps/debug/createNewSubscription");
    const data = await res.json();
    if (data.error) {
      setResponseData(data.error);
    } else if (data.confirmationUrl) {
      setResponseData("Redirecting");
      const { confirmationUrl } = data;
      open(confirmationUrl, "_top");
    }
  }

  return (
    <Page
      title="Billing API"
      backAction={{ content: "Home", onAction: () => router.push("/debug") }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <InlineStack align="space-between" wrap={false}>
              <p>
                Subscribe your merchant to a test $10.25 plan and redirect to
                your home page.
              </p>
              <Button variant="primary" onClick={() => fetchContent()}>
                Subscribe merchant
              </Button>
            </InlineStack>

            {
              /* If we have an error, it'll pop up here. */
              responseData && <p>{responseData}</p>
            }
          </Card>
        </Layout.Section>
        <Layout.Section>
          <ActiveSubscriptions />
        </Layout.Section>
      </Layout>
    </Page>
  );
};

const ActiveSubscriptions = () => {
  const [rows, setRows] = useState([]);

  async function getActiveSubscriptions() {
    const res = await fetch("/api/apps/debug/getActiveSubscriptions");
    const data = await res.json();

    //MARK:- Replace this yet another amazing implementation with swr or react-query
    let rowsData = [];
    const activeSubscriptions =
      data.body.data.appInstallation.activeSubscriptions;

    if (activeSubscriptions.length === 0) {
      rowsData.push(["No Plan", "N/A", "N/A", "USD 0.00"]);
    } else {
      console.log("Rendering Data");
      Object.entries(activeSubscriptions).map(([key, value]) => {
        const { name, status, test } = value;
        const { amount, currencyCode } =
          value.lineItems[0].plan.pricingDetails.price;
        rowsData.push([name, status, `${test}`, `${currencyCode} ${amount}`]);
      });
    }
    setRows(rowsData);
  }
  useEffect(() => {
    getActiveSubscriptions();
  }, []);

  return (
    <Card>
      <h1>Active Subscriptions</h1>
      <DataTable
        columnContentTypes={["text", "text", "text", "text"]}
        headings={["Plan Name", "Status", "Test", "Amount"]}
        rows={rows}
      />
    </Card>
  );
};

export default BillingAPI;
