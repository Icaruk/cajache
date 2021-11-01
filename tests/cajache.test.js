
const cajache = require("../lib/cajache");



describe("use", () => {
	
	const persona = {
		dinero: 0,
		nombre: "Pepe",
		edad: 123,
	};
	
	const sumaEuro = () => {
		persona.dinero ++;
		return persona.dinero;
	};
	
	const sumaEuroRetObj = () => {
		persona.dinero ++;
		return persona;
	};
	
	
	
	test("first, cached, fresh", async () => {
		
		let res = await cajache.use(
			"aaa",
			sumaEuro,
		);
		expect(res).toBe(1);
		
		
		res = await cajache.use(
			"aaa",
			sumaEuro,
		);
		expect(res).toBe(1);
		
		
		res = await cajache.use(
			"bbb",
			sumaEuro,
		);
		expect(res).toBe(2);
		
	});
	
	
	
	test("options.path", async () => {
		
		let res = await cajache.use(
			"path_1",
			sumaEuroRetObj,
			{
				path: "nombre",
			}
		);
		expect(res).toBe("Pepe");
		
	});
	
	
	
	test("options.condition boolean", async () => {
		
		let res = await cajache.use(
			"condition_1",
			sumaEuroRetObj,
			{
				condition: res => res.edad === 123,
			}
		);
		expect(res.edad).toBe(123);
		
		
		res = await cajache.use(
			"condition_2",
			sumaEuroRetObj,
			{
				condition: res => res.edad === 0,
			}
		);
		expect(res).toBe(null);
		
	});
	
	test("options.condition object", async () => {
		
		let res = await cajache.use(
			"condition_2",
			sumaEuroRetObj,
			{
				condition: res => {
					return {new: "isNew"};
				},
			}
		);
		
		expect(res.new).toBe("isNew");
		
	});
	
});