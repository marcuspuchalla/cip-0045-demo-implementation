import React, { useEffect, useRef, useState } from 'react';

import { DAppPeerConnect } from '@fabianbormann/cardano-peer-connect';
import {
  IDAppInfos,
  IWalletInfo
} from '@fabianbormann/cardano-peer-connect/types';

import {
  ConnectWalletButton,
  useCardano,
} from '@cardano-foundation/cardano-connect-with-wallet';

const App = () => {
  const copyButton = useRef<HTMLDivElement | null>(null);
  const disconnectButton = useRef<HTMLDivElement | null>(null);
  const txSubmitInput = useRef<HTMLInputElement | null>(null);
  const txSignInput = useRef<HTMLInputElement | null>(null);
  const qrCodeField = useRef<HTMLDivElement | null>(null);
  const dAppConnect = useRef<DAppPeerConnect | null>(null);
  const [meerkatAddress, setMeerkatAddress] = useState('');
  const [supportedWallets, setSupportedWallets] = useState([
    'eternl',
  ]);
  const sendButton = useRef<HTMLDivElement | null>(null);
  const signButton = useRef<HTMLDivElement | null>(null);

  const cardano = useCardano();

  useEffect(() => {


    window.addEventListener('beforeunload',  (event:any) => {
      event.preventDefault()
      event.returnValue = ''

      if(dAppConnect.current) {
        //ToDo: Disconnect
      }

      console.log('SERVER: window will be unload')

    })

    if (dAppConnect.current === null) {
      const verifyConnection = (
        walletInfo: IWalletInfo,
        callback: (granted: boolean) => void
      ) => {
        callback(
          window.confirm(`Do you want to connect to wallet ${walletInfo.name} (${walletInfo.address})?`)
        );
      };

      const onApiInject = (name: string, address: string) => {
        console.log('SERVER: onApiInject', name, address)

        setSupportedWallets([...supportedWallets, name]);
        cardano.connect(name);
      };

      const onApiEject = (name: string, address: string) => {

        console.log('SERVER: onApiEject', name, address)

        cardano.disconnect();
        setSupportedWallets(
          supportedWallets.filter((supportedWallet) => supportedWallet !== name)
        );
      };

      const dAppInfo: IDAppInfos = {
        name: 'Test Dapp 1',
        url: 'http://localhost:3001/'
      }

      dAppConnect.current = new DAppPeerConnect({
        dAppInfo: dAppInfo,
        verifyConnection: verifyConnection,
        onApiInject: onApiInject,
        onApiEject: onApiEject,
        onDisconnect: (address: string) => {
          console.log('SERVER: disconnect', address)
        }
      });

      setMeerkatAddress(dAppConnect.current.getAddress());

      if (qrCodeField.current !== null) {
        dAppConnect.current.generateQRCode(qrCodeField.current);
      }
    }


  }, []);


  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          height: 64,
          color: 'white',
          backgroundColor: '#3BA5A5',
          padding: '0 16px 0 16px',
        }}
      >
        <h3>Example dApp connecting to Eternl</h3>
        <div style={{ flexGrow: 1 }} />
        <ConnectWalletButton
          supportedWallets={supportedWallets}
          borderRadius={6}
          primaryColor="#297373"
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: 'calc(100vh - 64px - 32px)',
          backgroundColor: '#f5f5f5',
          padding: 16,
        }}
      >
        <h3>
          Please scan the QR code or share the address below with your wallet
          app.
        </h3>
        <div
          style={{ marginTop: 16, marginBottom: 16 }}
          ref={qrCodeField}
        ></div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 16,
          }}
        >
          <div>{meerkatAddress}</div>
          <div
            ref={copyButton}
            style={{
              padding: 10,
              marginTop: 12,
              backgroundColor: '#39393A',
              color: 'white',
              cursor: 'pointer',
            }}
            onClick={() => {
              navigator.clipboard.writeText(meerkatAddress).then(() => {
                if (copyButton.current) {
                  copyButton.current.innerText = 'Successfully copied!';
                  setTimeout(() => {
                    if (copyButton.current) {
                      copyButton.current.innerText = 'Copy';
                    }
                  }, 500);
                }
              });
            }}
          >
            Copy
          </div>

          <div
            ref={disconnectButton}
            style={{
              padding: 10,
              marginTop: 12,
              backgroundColor: '#39393A',
              color: 'white',
              cursor: 'pointer',
            }}
            onClick={() => {
              console.log('click disconnect')
              if(dAppConnect.current) {

                console.log('ToDo: Call disconnect', dAppConnect)

              } else {
                console.log('dapp undefined')
              }
            }}
          >
            Disconnect
          </div>



          <input
                ref={txSubmitInput}
                placeholder='signed tx cbor'
                style={{
                    width: '100%',
                }} type="text"/>

            <div
                ref={sendButton}
                style={{
                    padding: 10,
                    marginTop: 12,
                    backgroundColor: '#39393A',
                    color: 'white',
                    cursor: 'pointer',
                }}
                onClick={async () => {
                    console.log('input', txSubmitInput.current?.value)

                    // @ts-ignore
                    if(window.cardano !== undefined) {

                        // @ts-ignore
                        const api = window.cardano!.eternl!

                        if(api) {

                            console.log('api is', api)

                            const func = await api.enable()

                            console.log('funcs are', func)

                            console.log('submit', txSubmitInput.current?.value)

                            func.submitTx(txSubmitInput.current?.value)

                        } else {

                            console.log('No Eternl api is given')
                        }
                    } else {
                        console.log('No cardano api found.')
                    }
                }}
            >
                Submit signed TX
            </div>

            <hr />

          <input
              ref={txSignInput}
              placeholder='unsigend tx cbor'
              style={{
              width: '100%',
          }} type="text"/>

            <span>Partial sign is false!</span>
            <div
                ref={signButton}
                style={{
                    padding: 10,
                    marginTop: 12,
                    backgroundColor: '#39393A',
                    color: 'white',
                    cursor: 'pointer',
                }}
                onClick={async () => {
                    console.log('input', txSignInput.current?.value)

                    // @ts-ignore
                    if(window.cardano !== undefined) {

                        // @ts-ignore
                        const api = window.cardano!.eternl!

                        if(api) {

                            console.log('api is', api)

                            const func = await api.enable()

                            console.log('funcs are', func)

                            console.log('sign tx', txSignInput.current?.value)

                            const res = await func.signTx(txSignInput.current?.value, false, "abc")

                          console.log('res for sign', res)

                        } else {

                            console.log('No Eternl API is given')
                        }
                    } else {
                        console.log('No cardano api found.')
                    }
                }}
            >
                Sign TX
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;
