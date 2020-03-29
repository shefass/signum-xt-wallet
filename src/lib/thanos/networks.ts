import { TZStatsNetwork } from "lib/tzstats";
import { ThanosNetwork, ThanosNetworkType } from "lib/thanos/types";

export const NETWORKS: ThanosNetwork[] = [
  {
    id: "mainnet",
    name: "Tezos Mainnet",
    description: "Carthage mainnet",
    type: ThanosNetworkType.Main,
    rpcBaseURL: "https://mainnet.tezos.org.ua",
    tzStats: TZStatsNetwork.Mainnet,
    color: "#83b300",
    disabled: false
  },
  {
    id: "carthagenet",
    name: "Carthage Testnet",
    description: "Carthage testnet",
    type: ThanosNetworkType.Test,
    rpcBaseURL: "https://carthagenet.tezos.org.ua",
    tzStats: TZStatsNetwork.Carthagenet,
    color: "#0f4c81",
    disabled: false
  },
  {
    id: "babylonnet",
    name: "Babylon Testnet",
    description: "Babylon testnet",
    type: ThanosNetworkType.Test,
    rpcBaseURL: "https://babylonnet.tezos.org.ua",
    tzStats: TZStatsNetwork.Babylonnet,
    color: "#ed6663",
    disabled: false
  },
  {
    id: "labnet",
    name: "Lab Testnet",
    description: "Labnet testnet",
    type: ThanosNetworkType.Test,
    rpcBaseURL: "https://labnet.tezos.org.ua",
    tzStats: TZStatsNetwork.Labnet,
    color: "#f6c90e",
    disabled: false
  },
  {
    id: "zeronet",
    name: "Zeronet",
    description: "Zeronet testnet",
    type: ThanosNetworkType.Test,
    rpcBaseURL: "<no public nodes>",
    tzStats: TZStatsNetwork.Zeronet,
    color: "#e9e1cc",
    disabled: true
  }
];