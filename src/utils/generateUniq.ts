export function generateUniq() {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000000);
  const id = timestamp * 1000000 + randomNum;
  return id;
}