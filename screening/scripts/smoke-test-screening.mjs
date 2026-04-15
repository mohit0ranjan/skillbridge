#!/usr/bin/env node

/**
 * Screening funnel smoke test (isolated add-on verification)
 *
 * Usage:
 *   node screening/scripts/smoke-test-screening.mjs
 *
 * Optional env vars:
 *   SCREENING_BASE_URL=http://localhost:3000
 *   SCREENING_ADMIN_TOKEN=<sb_token_for_admin_user>
 *   SCREENING_EMAIL=<fixed_email_for_repeatable_runs>
 */

const baseUrl = (process.env.SCREENING_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
const adminToken = (process.env.SCREENING_ADMIN_TOKEN || "").trim();
const fixedEmail = (process.env.SCREENING_EMAIL || "").trim().toLowerCase();

function fail(message, details) {
  const error = new Error(message);
  if (details !== undefined) {
    error.details = details;
  }
  throw error;
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();

  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }

  return { response, body };
}

function statusLine(ok) {
  return ok ? "PASS" : "FAIL";
}

function printStep(title, ok, extra = "") {
  const suffix = extra ? ` - ${extra}` : "";
  console.log(`[${statusLine(ok)}] ${title}${suffix}`);
}

async function run() {
  const runId = Date.now();
  const email = fixedEmail || `screening-smoke-${runId}@example.com`;

  const leadPayload = {
    name: "Smoke Test Candidate",
    email,
    phone: "9999999999",
    college: "SkillBridge Test Institute",
    year: "3rd Year",
    branch: "Computer Science",
    source: "smoke-test",
  };

  console.log(`Base URL: ${baseUrl}`);
  console.log(`Lead email: ${email}`);

  // Step 1: apply should succeed
  const apply1 = await requestJson("/api/screening/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(leadPayload),
  });

  const apply1Ok = apply1.response.status === 200 && apply1.body?.success === true;
  printStep("POST /api/screening/apply returns success", apply1Ok, `status=${apply1.response.status}`);
  if (!apply1Ok) {
    fail("Apply failed", apply1.body);
  }

  // Step 2: duplicate apply should fail with 409
  const apply2 = await requestJson("/api/screening/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(leadPayload),
  });

  const duplicateOk = apply2.response.status === 409 && apply2.body?.success === false;
  printStep("Duplicate email is blocked", duplicateOk, `status=${apply2.response.status}`);
  if (!duplicateOk) {
    fail("Duplicate email behavior mismatch", apply2.body);
  }

  // Step 3: submit test should mark lead as screened
  const submit = await requestJson("/api/screening/submit-test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      answers: ["A", "B", "C", "D", "A"],
      subjectiveAnswer: "I enjoy learning and building projects.",
    }),
  });

  const submitOk = submit.response.status === 200 && submit.body?.success === true && submit.body?.data?.status === "screened";
  printStep("POST /api/screening/submit-test marks lead screened", submitOk, `status=${submit.response.status}`);
  if (!submitOk) {
    fail("Submit-test failed", submit.body);
  }

  // Step 4: optional admin verification (read-only leads API)
  if (!adminToken) {
    printStep("GET /api/screening/leads (admin verification)", true, "skipped (SCREENING_ADMIN_TOKEN not set)");
  } else {
    const leads = await requestJson(`/api/screening/leads?status=screened`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const hasLead = Array.isArray(leads.body?.data)
      && leads.body.data.some((item) => item.email?.toLowerCase() === email && item.status === "screened");

    const leadsOk = leads.response.status === 200 && leads.body?.success === true && hasLead;
    printStep("GET /api/screening/leads includes screened lead", leadsOk, `status=${leads.response.status}`);
    if (!leadsOk) {
      fail("Admin leads verification failed", leads.body);
    }
  }

  console.log("\nSmoke test completed successfully.");
}

run().catch((error) => {
  console.error("\nSmoke test failed.");
  console.error(error.message || error);
  if ((error.message || "").includes("fetch failed")) {
    console.error(
      `Could not connect to ${baseUrl}. Start the app server or set SCREENING_BASE_URL to a reachable deployment URL.`,
    );
  }
  if (error.details !== undefined) {
    console.error("Details:", JSON.stringify(error.details, null, 2));
  }
  process.exitCode = 1;
});
