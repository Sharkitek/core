import {
	SArray,
	SDecimal,
	SModel,
	SNumeric,
	SString,
	SDate,
	SBool,
	Model,
	ModelDefinition,
	SDefine, ModelIdentifier
} from "../src";

/**
 * Another test model.
 */
class Author extends Model<Author>
{
	name: string;
	firstName: string;
	email: string;
	createdAt: Date;
	active: boolean = true;

	protected SDefinition(): ModelDefinition<Author>
	{
		return {
			name: SDefine(SString),
			firstName: SDefine(SString),
			email: SDefine(SString),
			createdAt: SDefine(SDate),
			active: SDefine(SBool),
		};
	}

	constructor(name: string = undefined, firstName: string = undefined, email: string = undefined, createdAt: Date = undefined)
	{
		super();

		this.name = name;
		this.firstName = firstName;
		this.email = email;
		this.createdAt = createdAt;
	}
}

/**
 * A test model.
 */
class Article extends Model<Article>
{
	id: number;
	title: string;
	authors: Author[] = [];
	text: string;
	evaluation: number;

	protected SIdentifier(): ModelIdentifier<Article>
	{
		return "id";
	}

	protected SDefinition(): ModelDefinition<Article>
	{
		return {
			id: SDefine(SNumeric),
			title: SDefine(SString),
			authors: SDefine(SArray(SModel(Author))),
			text: SDefine(SString),
			evaluation: SDefine(SDecimal),
		};
	}
}

it("deserialize", () => {
	expect((new Article()).deserialize({
		id: 1,
		title: "this is a test",
		authors: [
			{ name: "DOE", firstName: "John", email: "test@test.test", createdAt: "2022-08-07T08:47:01.000Z", active: true, },
			{ name: "TEST", firstName: "Another", email: "another@test.test", createdAt: "2022-09-07T18:32:55.000Z", active: false, },
		],
		text: "this is a long test.",
		evaluation: "25.23",
	}).serialize()).toStrictEqual({
		id: 1,
		title: "this is a test",
		authors: [
			{ name: "DOE", firstName: "John", email: "test@test.test", createdAt: "2022-08-07T08:47:01.000Z", active: true, },
			{ name: "TEST", firstName: "Another", email: "another@test.test", createdAt: "2022-09-07T18:32:55.000Z", active: false, },
		],
		text: "this is a long test.",
		evaluation: "25.23",
	});
});

it("create and check state then serialize", () => {
	const now = new Date();
	const article = new Article();
	article.id = 1;
	article.title = "this is a test";
	article.authors = [
		new Author("DOE", "John", "test@test.test", now),
	];
	article.text = "this is a long test.";
	article.evaluation = 25.23;

	expect(article.isNew()).toBeTruthy();
	expect(article.getIdentifier()).toStrictEqual(1);

	expect(article.serialize()).toStrictEqual({
		id: 1,
		title: "this is a test",
		authors: [
			{ name: "DOE", firstName: "John", email: "test@test.test", createdAt: now.toISOString(), active: true, },
		],
		text: "this is a long test.",
		evaluation: "25.23",
	});
});


it("deserialize then save", () => {
	const article = (new Article()).deserialize({
		id: 1,
		title: "this is a test",
		authors: [
			{ name: "DOE", firstName: "John", email: "test@test.test", createdAt: new Date(), active: true, },
			{ name: "TEST", firstName: "Another", email: "another@test.test", createdAt: new Date(), active: false, },
		],
		text: "this is a long test.",
		evaluation: "25.23",
	});

	expect(article.isNew()).toBeFalsy();
	expect(article.isDirty()).toBeFalsy();
	expect(article.evaluation).toStrictEqual(25.23);

	article.text = "Modified text.";

	expect(article.isDirty()).toBeTruthy();

	expect(article.save()).toStrictEqual({
		id: 1,
		text: "Modified text.",
	});
});

it("save with modified submodels", () => {
	const article = (new Article()).deserialize({
		id: 1,
		title: "this is a test",
		authors: [
			{ name: "DOE", firstName: "John", email: "test@test.test", createdAt: new Date(), active: true, },
			{ name: "TEST", firstName: "Another", email: "another@test.test", createdAt: new Date(), active: false, },
		],
		text: "this is a long test.",
		evaluation: "25.23",
	});

	article.authors = article.authors.map((author) => {
		author.name = "TEST";
		return author;
	});

	expect(article.save()).toStrictEqual({
		id: 1,
		authors: [
			{ name: "TEST", },
			{}, //{ name: "TEST", firstName: "Another", email: "another@test.test" },
		],
	});
});
