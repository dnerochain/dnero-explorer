import TNS from 'tns-resolver';
import Config from '../config';

const endpoint = Config.ethRPCEndpoint || "https://eth-rpc-api.dnerochain.org/rpc";

const tns = new TNS({ customRpcEndpoint: endpoint });

export default tns;