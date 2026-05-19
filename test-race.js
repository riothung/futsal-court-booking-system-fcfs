const BASE = "http://localhost:5000/api";
async function loginAs(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  // Ambil token dari response body (karena cookie httpOnly)
  const data = await res.json();
  return data.token;
}
async function tryBooking(token, label) {
  const res = await fetch(`${BASE}/data/createBooking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id_court: 1,
      start_time: "2026-05-20T10:00:00.000Z",
      end_time: "2026-05-20T11:00:00.000Z",
    }),
  });
  const data = await res.json();
  console.log(`${label}: ${res.status} - ${data.message}`);
}
async function main() {
  const token1 = await loginAs("user1@test.com", "password1");
  const token2 = await loginAs("user2@test.com", "password2");
  // Kirim 2 request booking BERSAMAAN
  const [r1, r2] = await Promise.all([tryBooking(token1, "User 1"), tryBooking(token2, "User 2")]);
  // Hanya 1 yang berhasil (201), satunya kena 409
}
main();
