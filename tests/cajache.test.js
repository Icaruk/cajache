
const cajache = require("../lib/cajache");



describe("use", () => {
	
	const person = {
		money: 0,
		name: "Pepe",
		age: 123,
		metadata: {
			createdAt: "yesterday",
			updatedAt: "today",
		}
	};
	
	const addMoney = () => {
		person.money ++;
		return person.money;
	};
	
	const AddMoneyRetObj = () => {
		person.money ++;
		return person;
	};
	
	
	
	test("first, cached, fresh", async () => {
		
		let res = await cajache.use(
			"aaa",
			addMoney,
		);
		expect(res).toBe(1);
		
		
		res = await cajache.use(
			"aaa",
			addMoney,
		);
		expect(res).toBe(1);
		
		
		res = await cajache.use(
			"bbb",
			addMoney,
		);
		expect(res).toBe(2);
		
	});
	
	
	
	test("options.path", async () => {
		
		let res = await cajache.use(
			"path_1",
			AddMoneyRetObj,
			{
				path: "name",
			}
		);
		expect(res).toBe("Pepe");
		
	});
	
	test("options.path_deep", async () => {
		
		let res = await cajache.use(
			"path_2",
			AddMoneyRetObj,
			{
				path: "metadata.createdAt",
			}
		);
		expect(res).toBe("yesterday");
		
	});
	
	
	
	test("options.condition boolean", async () => {
		
		let res = await cajache.use(
			"condition_true_then_cache",
			AddMoneyRetObj,
			{
				condition: res => res.age === 123,
			}
		);
		expect(res.age).toBe(123);
		
		
		res = await cajache.use(
			"condition_false_then_nocache",
			AddMoneyRetObj,
			{
				condition: res => res.age === 0,
			}
		);
		expect(res.age).toBe(123);
		
	});
	
});