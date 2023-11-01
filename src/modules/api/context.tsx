import {
	createContext,
	FunctionComponent,
	PropsWithChildren,
	useContext,
	useMemo,
	useState,
} from "react";
import { RekorClient } from "rekor";

export interface RekorClientContext {
	client: RekorClient;
	baseUrl?: string;
	setBaseUrl: (base: string | undefined) => void;
}

export const RekorClientContext = createContext<RekorClientContext | undefined>(
	undefined,
);

export const RekorClientProvider: FunctionComponent<PropsWithChildren<{}>> = ({
	children,
}) => {
	const [baseUrl, setBaseUrl] = useState<string>();

	const context: RekorClientContext = useMemo(() => {
		if (baseUrl === undefined && process.env.NEXT_PUBLIC_REKOR_DEFAULT_DOMAIN) {
			setBaseUrl(process.env.NEXT_PUBLIC_REKOR_DEFAULT_DOMAIN)
		}

		return {
			client: new RekorClient({ BASE: baseUrl }),
			baseUrl,
			setBaseUrl,
		};
	}, [baseUrl]);

	return (
		<RekorClientContext.Provider value={context}>
			{children}
		</RekorClientContext.Provider>
	);
};

export function useRekorClient(): RekorClient {
	const ctx = useContext(RekorClientContext);

	if (!ctx) {
		throw new Error("Hook useRekorClient requires RekorClientContext.");
	}

	return ctx.client;
}

export function useRekorBaseUrl(): [
	RekorClientContext["baseUrl"],
	RekorClientContext["setBaseUrl"],
] {
	const ctx = useContext(RekorClientContext);

	if (!ctx) {
		throw new Error("Hook useRekorBaseUrl requires RekorClientContext.");
	}

	return [ctx.baseUrl, ctx.setBaseUrl];
}
