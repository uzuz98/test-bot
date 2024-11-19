
# Ethereum Super Wallet SDK Bot Integration For React

Welcome to Coin98 Wallet Developer Guide. This documentation contains guides for developers to get started developing on Coin98 Telegram Bot.‌

# Initialize SDK

```
import { Coin98Provider } from '~coin98-com/telegram-connect-sdk'
<Coin98Provider chainId={chainId} partner={partner}>
	{children}
</Coin98Provider>
```
Explain:
- chainId: specific chain id evm
- partner: specific partner to know which is connecting

----------


To connect Coin98 Wallet

To connect Coin98 Wallet means to access the user's [blockchain - like Ethereum] account(s).

```
import { useEvmHandle } from '~coin98-com/telegram-connect-sdk'

const { connect } = useEvmHandle()
await connect()
```

----------

## To experience functions

Once your account is connected, let's start experiencing more functions.‌

###  Transfer

return `Promise<hash>` - Initiates a new transaction.

```
import { useEvmHandle } from '~coin98-com/telegram-connect-sdk'
const {sendTransaction, address} = useEvmHandle()

const handleSendTransaction = async () => {
	await sendTransaction({
		from: address,
		to: {{TO_ADDRESS}},
		value: '0x0'
	})
}
```

### Decrypt

return `Promise<string>` - Decrypts an encrypted message.

```
import { useEvmHandle } from '~coin98-com/telegram-connect-sdk'
const {decryptKey} =  useEvmHandle()
await  decryptKey(<DATA_ENCRYPT>)
```

### Get Encryption Public Key

return `Promise<string>`- The public encryption key of the Ethereum account whose encryption key should be retrieved

```
import { useEvmHandle } from '~coin98-com/telegram-connect-sdk'
const { getEncryptionKey } = useEvmHandle()
await getEncryptionKey()
```

### Encrypt
return `Promise<string>` - Encrypt message.
```
import { useEvmHandle } from '~coin98-com/telegram-connect-sdk'
const { encryptKey } =  useEvmHandle()
encryptKey(value);
```

### Add Ethereum Chain
Currently - The telegram bot does not support add new chain

### Switch Ethereum Chain

Currently - Just change chainId in the parameter before use any method, the telegram super wallet bot will auto detect and switch chain in super wallet bot

### Watch Asset

Currently - The telegram bot does not support watch asset

### RPC Request

Currently - The telegram bot does not support rpc request

### Sign Typed Data
return `Promise<string>` - Presents a structured data message for the user to sign.
```
import { useEvmHandle } from '~coin98-com/telegram-connect-sdk'
const { signTypedData, address } = useEvmHandle()

const handleSignPersonal = () => {
	signTypedData([
		{
			"type": "string",
			"name": "Message",
			"value": "Hi, Alice!"
		},
		{
			"type": "uint32",
			"name": "A number",
			"value": "1337"
		}
	])
}
```

### Sign Typed Data V3
return `Promise<string>` - Presents a structured data message for the user to sign.
```
import { useEvmHandle } from '~coin98-com/telegram-connect-sdk'
const { signTypedDataV3, address, chainId } = useEvmHandle()

const handleSignPersonal = () => {
	signTypedDataV3({
		types: {
			EIP712Domain: [
				{ name: "name", type: "string" },
				{ name: "version", type: "string" },
				{ name: "chainId", type: "uint256" },
				{ name: "verifyingContract", type: "address" },
			],
			Person: [
				{ name: 'name', type: 'string' },
				{ name: 'wallet', type: 'address' },
			],
			Mail: [
				{ name: 'from', type: 'Person' },
				{ name: 'to', type: 'Person' },
				{ name: 'contents', type: 'string' },
			],
		},
		primaryType: 'Mail',
		domain: {
		name: 'Ether Mail',
		version: '1',
		chainId: Number(chainId),
		verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
		},
		message: {
			from: {
				name: 'Cow',
				wallet: <FROM ADDRESS>,
			},
			to: {
				name: 'Bob',
				wallet: <TO ADDRESS>,
			},
			contents: 'Hello, Bob!',
		},
	})
}
```

### Sign Typed Data V4
return `Promise<string>` - Presents a structured data message for the user to sign.
```
import { useEvmHandle } from '~coin98-com/telegram-connect-sdk'
const { signTypedDataV4, address, chainId } = useEvmHandle()

const handleSignPersonal = () => {
	signTypedDataV4({
		domain: {
		chainId: Number(chainId),
		name: 'Ether Mail',
		verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
		version: '1',
		},
		message: {
			contents: 'Hello, Bob!',
			from: {
				name: 'Cow',
				wallets: [
					'0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
					'0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
				],
			},
			to: [
				{
					name: 'Bob',
					wallets: [
						'0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
						'0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
						'0xB0B0b0b0b0b0B000000000000000000000000000',
					],
				},
			],
			attachment: '0x',
		},
		primaryType: 'Mail',
		types: {
			EIP712Domain: [
				{ name: "name", type: "string" },
				{ name: "version", type: "string" },
				{ name: "chainId", type: "uint256" },
				{ name: "verifyingContract", type: "address" },
			],
			Group: [
				{ name: 'name', type: 'string' },
				{ name: 'members', type: 'Person[]' },
			],
			Mail: [
				{ name: 'from', type: 'Person' },
				{ name: 'to', type: 'Person[]' },
				{ name: 'contents', type: 'string' },
				{ name: 'attachment', type: 'bytes' },
			],
			Person: [
				{ name: 'name', type: 'string' },
				{ name: 'wallets', type: 'address[]' },
			],
		}
	})
}
```

### Personal Sign
return `Promise<string>` - Presents a plain text signature challenge to the user.
```
const { personalSign } = useEvmHandle()

const handleSignPersonal = () => {
	personalSign({
		message: 'This is message'
	})
}
```