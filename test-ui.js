const form = {
  name: "UI Tester",
  email: `ui.test.${Date.now()}@example.com`,
  phone: "1234567890",
  college: "UI College",
  year: "3rd",
  branch: "CSE"
};

fetch("http://localhost:3000/api/screening/apply", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(form)
})
.then(async (res) => {
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Body:", text);
})
.catch(console.error);
