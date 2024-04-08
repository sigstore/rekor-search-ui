const useRouter = jest.fn(() => ({
	push: jest.fn(),
	pathname: "/",
	query: {},
	asPath: "",
}));

module.exports = {
	useRouter,
};
