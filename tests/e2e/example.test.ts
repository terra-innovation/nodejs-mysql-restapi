describe("Basic Jest test example", () => {
  beforeAll(() => {
    console.log("Iniciando pruebas...");
  });

  afterAll(() => {
    console.log("Finalizando pruebas...");
  });

  it("should pass a basic test", () => {
    console.log("Ejecutando prueba básica...");
    expect(true).toBe(true); // Una aserción simple que siempre pasa.
  });

  it("should log a message", () => {
    console.log("Ejecutando otra prueba...");
    expect(1 + 1).toBe(2); // Aserción básica.
  });
});
