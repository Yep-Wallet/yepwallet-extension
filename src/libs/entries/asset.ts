import Joi from "joi";
import { JettonMinterContent } from "../../libs/ton-wrappers";

export interface JettonParams {
  type: "jetton";
  // The address of the minter contract
  address: string;
  // A ticker symbol or shorthand, up to 11 characters
  symbol?: string;
  // A string url of the token logo
  image?: string;
  // A jetton name
  name?: string;
  // A jetton decimals
  decimals?: string;
}

export const JettonParamsSchema = Joi.object<JettonParams>({
  type: Joi.string().required().valid("jetton"),
  address: Joi.string().required(),
  symbol: Joi.string(),
  image: Joi.string(),
  name: Joi.string(),
  decimals: Joi.string(),
});

export interface NftParams {
  type: "nft";
  // The address of the nft contract
  address: string;
}

export const NftParamsSchema = Joi.object<NftParams>({
  type: Joi.string().required().valid("nft"),
  address: Joi.string().required(),
});

export type AssetParams = JettonParams | NftParams;

export const JettonStateSchema = Joi.object<JettonMinterContent>({
  name: Joi.string().required(),
  symbol: Joi.string().required(),
  description: Joi.string().allow(null, "").optional(), // 允许为空字符串或 null
  image: Joi.string(),
  decimals: Joi.string(),
}).unknown();

export interface JettonAsset {
  state: JettonMinterContent;
  minterAddress: string;
  walletAddress?: string;
}

export type NftItemState = ImageNftState | DomainNftState;

export interface ImageNftState {
  image: string;
  name?: string;
  description?: string;
}

export interface DomainNftState {
  name?: string;
  root: string;
  domain: string;
}

export const NftItemStateSchema = Joi.object<NftItemState>({
  image: Joi.string().required(),
  name: Joi.string(),
  description: Joi.string(),
}).unknown();

export interface NftItem {
  state: NftItemState | null;
  contentUri: string | null;
  address: string;
}

export interface NftCollectionState {
  image: string;
  name?: string;
  description?: string;
}

export const NftCollectionStateSchema = Joi.object<NftCollectionState>({
  image: Joi.string().required(),
  name: Joi.string(),
  description: Joi.string(),
}).unknown();

export interface NftAsset {
  items: NftItem[];
  state: NftCollectionState | null;
  collectionAddress: string;
}

export interface NftApi {
  address: string;
  index: number;
  owner: {
    address: string;
    name: string;
    is_scam: boolean;
    is_wallet: boolean;
  };
  collection: {
    address: string;
    name: string;
    description: string;
  };
  verified: boolean;
  metadata: {
    name: string;
    image: string;
    description: string;
  };
  previews: {
    resolution: string;
    url: string;
  }[];
  approved_by: any[];
  trust: string;
}

export interface NftCollectionApi {
  address: string;
  next_item_index: number;
  owner: {
    address: string;
    name: string;
    is_scam: boolean;
    icon: string;
    is_wallet: boolean;
  };
  raw_collection_content: string;
  metadata: {
    social_links: string[];
    external_link: string | null;
    name: string;
    image: string;
    cover_image: string;
    description: string;
    marketplace: string;
    external_url: string;
  };
  previews: {
    resolution: string;
    url: string;
  }[];
  approved_by: any[];
}

export type Asset = JettonAsset | NftAsset;
