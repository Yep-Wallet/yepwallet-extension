import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	ButtonColumn,
	ButtonNegative,
	ButtonPositive,
	ButtonRow,
	Center,
	ErrorMessage,
	Gap,
	Text,
} from "../../../components/Components";
import { Fingerprint } from "../../../components/Fingerprint";
import { sendBackground } from "../../../event";
import { AppRoute } from "../../../routes";
import { BodyWrapper, CreateH1, CreateText } from "../../import/CreateWallet";
import { useLockScreen } from "../api";
import {
	useChangePasswordMigration,
	useLargeBlobMigration,
	useRegistrationMigration,
	useVerificationMigration,
} from "./api";

const Note = () => {
	return (
		<>
			<CreateText>
				WebAuthn is a browser API that enables the use of physical,
				cryptographically-secure hardware "authenticators" to provide
				stronger replacements to passwords.
			</CreateText>
			<CreateText>
				The feature "Biometric Authentication" is experimental and it
				will re-encrypt mnemonic phrases. Back up your mnemonic phrases
				to not lost access to wallets.
			</CreateText>
			<CreateText>
				Enabling the feature required to enter biometrics two or there
				times. For registration and for verification access.
			</CreateText>
		</>
	);
};

export const WebAuthnEnableMigration = () => {
	const navigate = useNavigate();

	const [total, setTotal] = useState(2);
	const [start, setStart] = useState(false);
	const [isDone, setDone] = useState(false);

	const {
		mutateAsync: registrationAsync,
		error: registrationError,
		reset: registrationReset,
		isLoading: isRegistration,
	} = useRegistrationMigration();

	console.log(
		"sasdsad",
		registrationAsync,
		registrationError,
		registrationReset,
		isRegistration
	);

	const {
		mutateAsync: largeBlobAsync,
		error: largeBlobError,
		reset: largeBlobReset,
		isLoading: isLargeBlob,
	} = useLargeBlobMigration();

	const {
		mutateAsync: verificationAsync,
		error: verificationError,
		reset: verificationReset,
		isLoading: isVerification,
	} = useVerificationMigration();

	const {
		mutateAsync: changeAsync,
		error: changeError,
		reset: changeReset,
		isLoading: isChanging,
	} = useChangePasswordMigration();

	const onRegistration = useCallback(async () => {
		setStart(true);

		registrationReset();
		largeBlobReset();
		verificationReset();
		changeReset();

		const result = await registrationAsync();
		if (result.type === "largeBlob") {
			setTotal(3);
			await largeBlobAsync(result);
		}
		const props = await verificationAsync(result);
		await changeAsync(props);
		setDone(true);
	}, []);

	const onCancel = useCallback(() => {
		navigate(AppRoute.settings);
	}, []);

	const { data: isLockScreen } = useLockScreen();

	const onLock = useCallback(async () => {
		sendBackground.message("lock");
	}, []);

	const disabledCancel =
		start &&
		registrationError == null &&
		verificationError == null &&
		changeError == null;

	return (
		<BodyWrapper>
			<CreateH1>Enable Biometric Authentication</CreateH1>
			{!start && <Note />}
			<Gap />
			{isRegistration && (
				<div>
					<Center>
						<Text>Step 1 of 2 - Registration</Text>
					</Center>
					<Fingerprint />
				</div>
			)}
			{isLargeBlob && (
				<div>
					<Center>
						<Text>Step 2 of 3 - Store</Text>
					</Center>
					<Fingerprint />
				</div>
			)}
			{(isVerification || isChanging) && (
				<div>
					<Center>
						<Text>
							Step {total} of {total} - Verification
						</Text>
					</Center>
					<Fingerprint />
				</div>
			)}
			{isDone && (
				<div>
					<Center>
						<Text>Biometric Authentication Enabled!</Text>
					</Center>
					<Fingerprint />
				</div>
			)}
			<Gap />
			{registrationError && (
				<ErrorMessage>{registrationError.message}</ErrorMessage>
			)}
			{verificationError && (
				<ErrorMessage>{verificationError.message}</ErrorMessage>
			)}
			{changeError && <ErrorMessage>{changeError.message}</ErrorMessage>}
			{largeBlobError && (
				<ErrorMessage>{largeBlobError.message}</ErrorMessage>
			)}

			{!isDone && (
				<ButtonRow style={{ gap: 5 }}>
					<ButtonNegative
						disabled={disabledCancel}
						onClick={onCancel}
					>
						Cancel
					</ButtonNegative>
					<ButtonPositive disabled={start} onClick={onRegistration}>
						Enable
					</ButtonPositive>
				</ButtonRow>
			)}
			{isDone && (
				<ButtonColumn style={{ gap: 15 }}>
					{isLockScreen ? (
						<ButtonPositive onClick={onLock}>
							Lock Account
						</ButtonPositive>
					) : (
						<ButtonPositive onClick={() => navigate(AppRoute.home)}>
							Home
						</ButtonPositive>
					)}
				</ButtonColumn>
			)}
		</BodyWrapper>
	);
};
