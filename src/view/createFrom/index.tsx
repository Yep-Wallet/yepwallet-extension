import {
	Button,
	Checkbox,
	DatePicker,
	Form,
	Input,
	message,
	Radio,
	Select,
	Spin,
	Typography,
	Upload,
} from "antd";
import React, { useEffect, useState } from "react";

import TextArea from "antd/es/input/TextArea";
import { Chain } from "../../utils";
import {
	bindSolana,
	callInjectedFunction,
	getAddress,
	solanaChainIds,
} from "../replaceTweetContent";

const { Option } = Select;

const onFinishFailed = (errorInfo: any) => {
	console.log("Failed:", errorInfo);
};

// let formData = {
//   title: 'pump.fun',
//   logo: 'pumpLogo.webp',
//   submitBtn: {
//     label: 'Create coin',
//     href: '',
//   },
//   formFields: [
//     {
//       type: 'text',
//       name: 'name',
//       label: 'Name',
//       required: true,
//     },
//     {
//       type: 'text',
//       name: 'ticker',
//       label: 'Ticker',
//       required: true,
//     },
//     {
//       type: 'email',
//       name: 'email',
//       label: 'Email',
//       required: true,
//     },
//     {
//       type: 'password',
//       name: 'password',
//       label: 'Password',
//       required: true,
//     },
//     {
//       type: 'select',
//       name: 'country',
//       label: 'Country',
//       options: [
//         {
//           value: 'US',
//           label: 'United States',
//         },
//         {
//           value: 'CA',
//           label: 'Canada',
//         },
//         {
//           value: 'UK',
//           label: 'United Kingdom',
//         },
//       ],
//       required: true,
//     },
//     {
//       type: 'checkbox',
//       name: 'terms',
//       label: 'I agree to the terms and conditions',
//       required: true,
//     },
//     {
//       type: 'textarea',
//       name: 'description',
//       label: 'Description',
//       required: true,
//     },
//     {
//       type: 'file',
//       name: 'image',
//       label: 'Image',
//       accept: 'image/*',
//       action: 'https://api.memelinks.xyz/link/image/upload',
//       fileMaxSize: 2,
//     },
//     {
//       type: 'date',
//       name: 'birthday',
//       label: 'Birthday',
//       required: true,
//     },
//     {
//       type: 'radio',
//       name: 'gender',
//       label: 'Gender',
//       options: [
//         {
//           value: 'male',
//           label: 'Male',
//         },
//         {
//           value: 'female',
//           label: 'Female',
//         },
//         {
//           value: 'other',
//           label: 'Other',
//         },
//       ],
//       required: true,
//     },

//     {
//       type: 'text',
//       name: 'optional',
//       label: 'Choose how many [ticker] you want to buy (optional)',
//       required: false,
//       placeholder: '0.0 (optional)',
//       suffix: {
//         label: 'SOL',
//         icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
//       },
//     },
//   ],
// };
const CreateFrom: React.FC = ({ content, id }: any) => {
	const [loading, setLoading] = useState(false);
	const [load, _load] = useState(false);
	const [icon, _icon] = useState("");

	const [data, _data]: any = useState(null);
	const [form] = Form.useForm();
	const [submittable, setSubmittable] = React.useState<boolean>(false);

	const values = Form.useWatch([], form);

	React.useEffect(() => {
		form.validateFields({ validateOnly: true })
			.then(() => setSubmittable(true))
			.catch(() => setSubmittable(false));
	}, [form, values]);

	const onFinish = async (values: any) => {
		bindPerform(values);
	};

	const bindPreview = () => {
		let values = form.getFieldsValue();
		console.log("values", values);
	};

	//getLinkImage
	const handleChange = async (info: any) => {
		if (info.file.status === "uploading") {
			setLoading(true);
			return;
		}
		if (info.file.status === "done") {
			console.log("info.file", info.file);

			let imageName = info.file?.response?.imageName;

			let icon = imageName;
			setLoading(false);
			if (icon) {
				form.setFieldValue("image", icon);
				_icon(icon);
			} else {
				form.setFieldValue("image", "");
				_icon("");
			}
		}
	};
	const beforeUpload = (data: any, file: any) => {
		const isJpgOrPng =
			file.type === "image/jpeg" || file.type === "image/png";

		if (!isJpgOrPng) {
			message.error("You can only upload JPG/PNG file!");
		}
		const isLt2M = file.size / 1024 / 1024 < data?.fileMaxSize;
		if (!isLt2M) {
			message.error("Image must smaller than 2MB!");
		}
		return isJpgOrPng && isLt2M;
	};

	function getVariableNames(str: string) {
		const regex = /\[([^\]]+)\]/g; // 正则表达式匹配 [变量]

		let match;

		while ((match = regex.exec(str)) !== null) {
			let variableName = match[1].trim(); // 获取匹配到的变量名称
			return variableName;
		}
	}

	const getLabel = (label: string) => {
		let variableName = getVariableNames(label);
		return label.replace(
			`${variableName}`,
			form.getFieldValue([variableName]) || "????"
		);
	};

	// 执行操作
	const bindPerform = async (values: any) => {
		try {
			_load(true);
			let chainId = `${Chain[data?.chain]}` || "900";
			// 先获取对应钱包地址
			let address = await getAddress(chainId);

			if (!address) {
				_load(false);
				return;
			}

			let obj = {
				name: values.name,
				symbol: values.ticker,
				uri: values.image,
				solAmount: values.optional || 0,
				account: address,
			};

			let url = data?.submitBtn?.href;
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					// 在这里可以添加其他请求头信息，比如 Authorization 等
				},
				body: JSON.stringify(obj),
			});
			const responseData = await response.json(); // 如果需要将响应内容解析为 JSON

			let hexValue = responseData?.transaction;

			if (hexValue) {
				if (solanaChainIds.includes(Number(chainId))) {
					let result = await bindSolana(hexValue);
					if (result.error) {
						message.error(result.error);
						_load(false);
						return;
					}

					console.log("result", result);

					if (result) {
						_load(false);
						message.success("Operation successful");
					}
				} else {
					let result: any = await callInjectedFunction(
						`RES_SIGN_AND_SEND_TRANSACTION`,
						`REQ_SIGN_AND_SEND_TRANSACTION`,
						hexValue
					);
					if (result.error) {
						message.error(result.error);
						_load(false);
						return;
					}
					if (result) {
						_load(false);
						message.success("Operation successful");
					}
				}
			} else {
				_load(false);

				message.error(responseData?.message);
			}
		} catch (error: any) {
			if (error?.response?.data?.message) {
				message.error(error?.response?.data?.message);
			}
			_load(false);
		}
	};

	const extractPump = (input: string) => {
		const regex = /\$(.*?)\$/;
		const match = input.match(regex);
		return match ? match[1] : null;
	};
	// 获取表单数据
	const getData = async (content: any) => {
		try {
			const command = extractPump(content);

			console.log("command", command);

			let url = `https://api.memelinks.xyz/link/command/${command}`;
			const response = await fetch(url, {
				method: "GET",
			});
			const data = await response.json(); // 如果需要将响应内容解析为 JSON

			if (data) {
				_data(data);
			} else {
				_data(null);
			}
		} catch (error) {
			console.log("error", error);

			_data(null);
		}
	};

	useEffect(() => {
		if (content) {
			getData(content);
		}
	}, [content]);
	return (
		<Spin spinning={load}>
			<div id={`memelinks${id}`}>
				{data && (
					<div
						className="createFrom"
						onClick={(e) => {
							e.stopPropagation();
							// e.preventDefault();
						}}
					>
						<Form
							form={form}
							name=""
							layout="vertical"
							style={{ width: "100%" }}
							initialValues={{}}
							size="large"
							onFinish={onFinish}
							onFinishFailed={onFinishFailed}
							onValuesChange={(values) => {
								bindPreview();
							}}
							autoComplete="off"
						>
							<Typography.Title
								level={3}
								style={{ marginBottom: 24 }}
								className="createFromTitle"
							>
								<img
									className="createFromTitleIcon"
									src={data?.logo || ""}
								/>{" "}
								<span className="createFromTitleSpan">
									{data?.title}
								</span>
							</Typography.Title>
							<>
								{data?.formFields.map(
									(field: any, index: number) => {
										switch (field.type) {
											case "text":
											case "email":
											case "password":
												return (
													<Form.Item
														key={index}
														label={
															<div className="createFromLabel">
																{getLabel(
																	field?.label
																)}
															</div>
														}
														name={field?.name}
														rules={[
															{
																required:
																	field?.required,
															},
														]}
													>
														<Input
															placeholder={
																field?.placeholder ||
																""
															}
															suffix={
																field?.suffix ? (
																	<div className="createFromInputSuffix">
																		<span>
																			{
																				field
																					?.suffix
																					?.label
																			}
																		</span>
																		<span className="createFromInputSuffixSpan">
																			<img
																				className="createFromInputSuffixImg"
																				src={
																					field
																						?.suffix
																						?.icon
																				}
																			/>
																		</span>
																	</div>
																) : null
															}
														/>
													</Form.Item>
												);
											case "textarea":
												return (
													<Form.Item
														key={index}
														label={
															<div className="createFromLabel">
																{getLabel(
																	field?.label
																)}
															</div>
														}
														name={field?.name}
														rules={[
															{
																required:
																	field?.required,
															},
														]}
													>
														<TextArea
															autoSize={{
																minRows: 3,
																maxRows: 5,
															}}
														/>
													</Form.Item>
												);
											case "file":
												return (
													<Form.Item
														key={index}
														label={
															<div className="createFromLabel">
																{field?.label}
															</div>
														}
														name={field?.name}
														rules={[
															{
																required:
																	field?.required,
															},
														]}
													>
														<Upload
															name="image"
															headers={
																{
																	// Authorization: `Bearer ${xCode}`,
																}
															}
															showUploadList={
																false
															}
															action={
																field?.action
															}
															beforeUpload={(
																file
															) =>
																beforeUpload(
																	field,
																	file
																)
															}
															onChange={
																handleChange
															}
														>
															<div className="createFromUpload">
																<Button
																	loading={
																		loading
																	}
																	style={{
																		border: 0,
																		padding:
																			"3px 7px",
																		height: 32,
																		color: "#000",
																		background:
																			"#fff",
																	}}
																>
																	<div>
																		Upload
																	</div>
																</Button>
																<span className="createFromUploadSpan">
																	{icon ||
																		"No file is selected"}
																</span>
															</div>
														</Upload>
													</Form.Item>
												);

											case "select":
												return (
													<Form.Item
														key={index}
														label={
															<div className="createFromLabel">
																{getLabel(
																	field?.label
																)}
															</div>
														}
														name={field?.name}
														rules={[
															{
																required:
																	field?.required,
															},
														]}
													>
														<Select
															options={
																field?.options
															}
														/>
													</Form.Item>
												);

											case "checkbox":
												return (
													<Form.Item
														key={index}
														valuePropName="checked"
														name={field?.name}
														rules={[
															{
																required:
																	field?.required,
															},
														]}
													>
														<Checkbox>
															<span className="createFromLabel">
																{getLabel(
																	field?.label
																)}
															</span>
														</Checkbox>
													</Form.Item>
												);

											case "date":
												return (
													<Form.Item
														key={index}
														label={
															<div className="createFromLabel">
																{getLabel(
																	field?.label
																)}
															</div>
														}
														name={field?.name}
														rules={[
															{
																required:
																	field?.required,
															},
														]}
													>
														<DatePicker />
													</Form.Item>
												);

											case "radio":
												return (
													<Form.Item
														key={index}
														label={
															<div className="createFromLabel">
																{getLabel(
																	field?.label
																)}
															</div>
														}
														name={field?.name}
														rules={[
															{
																required:
																	field?.required,
															},
														]}
													>
														<Radio.Group>
															{field?.options.map(
																(item: any) => {
																	return (
																		<Radio
																			key={
																				item.label
																			}
																			value={
																				item.value
																			}
																		>
																			{
																				item.value
																			}
																		</Radio>
																	);
																}
															)}
														</Radio.Group>
													</Form.Item>
												);
											default:
												return null;
										}
									}
								)}
							</>

							<Form.Item>
								<Button
									loading={load}
									disabled={!submittable}
									type="primary"
									className="createFromBtn"
									htmlType="submit"
								>
									{data?.submitBtn?.label}
								</Button>
							</Form.Item>
						</Form>
					</div>
				)}
			</div>
		</Spin>
	);
};

export default CreateFrom;
