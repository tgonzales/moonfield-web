import { getCustomerAccountGraphqlUrl } from "./config";

/** Note: no "Bearer " prefix — the Customer Account API takes the raw access token in Authorization. */
export async function customerAccountGraphQL<T>(
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const url = await getCustomerAccountGraphqlUrl();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: accessToken },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Customer Account API request failed (${res.status}): ${await res.text()}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`Customer Account API returned errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}

const CURRENT_CUSTOMER_QUERY = `
  query CurrentCustomer {
    customer {
      id
      emailAddress { emailAddress }
      firstName
      lastName
    }
  }
`;

export interface CurrentCustomer {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export async function fetchCurrentCustomer(accessToken: string): Promise<CurrentCustomer> {
  const data = await customerAccountGraphQL<{
    customer: { id: string; emailAddress: { emailAddress: string } | null; firstName: string | null; lastName: string | null };
  }>(accessToken, CURRENT_CUSTOMER_QUERY);

  return {
    id: data.customer.id,
    email: data.customer.emailAddress?.emailAddress ?? "",
    firstName: data.customer.firstName,
    lastName: data.customer.lastName,
  };
}
