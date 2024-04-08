const decodex509Mock = jest.fn().mockReturnValue({
	publicKey:
		"-----BEGIN CERTIFICATE-----Mocked Certificate-----END CERTIFICATE-----",
	subject: "Mocked Subject",
});

export default decodex509Mock;
