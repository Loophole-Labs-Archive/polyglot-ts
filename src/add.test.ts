import add from "./add";

it("Can add 1 and 2", () => {
  const res = add(1, 2);

  expect(res).toBe(3);
});
