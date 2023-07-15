# navra - trusted fishing

![jpg](https://github.com/bussealle/navra-akindo/blob/main/image/navra_top.png)


## 🎣 Overview(プロジェクト概要)
近年、釣り人と釣り場関係者の関係性が悪化しており、日本各地で釣り禁止のエリアが急増しています。また釣り人同士に内在する競合関係により、承認欲求に基づいた既存のSNS型釣果情報プラットフォームには、釣り人が欲する正確で詳細な情報が集まっていません。私たちは上記の２つのトラストに関する問題に対し、以下３つの観点から解決を試みます。

1. 釣果と貢献を表す２種同量のトークン発行
2. ユーティリティに基づくトークンエコノミー設計
3. 位置情報と釣果レートを用いた釣りのゲーム性の拡張
   
私たちのサービス「navra」に釣果をアップロードすると、釣り場には換金性が保証されたトークン、釣り人には換金性のないトークンの２つが同量発行されます。釣り人が正確で詳細な釣果を蓄積することで、釣り場の価値が向上しより多くトークンが集まる仕組みです。釣り人は釣果情報を貢献実績を証明するトークンとして獲得します。１つの釣果におけるトークン量は「魚種・場所・時期」の変数で釣り場の需要と期待値をレートとして表現し、今までになかった釣り×貢献×位置情報という新しいゲームの実現を目指します。(481字)


_Keywords: Fishing、GameFi、ReFi、ERC1155、NFT、SBT、Multitoken、SocialToken、GPS Game、Trustless、MetaTx、Massadoption_

## 🛠 Tech stacks

![jpg](https://github.com/bussealle/navra-akindo/blob/main/image/navra_techstack.jpg)

#### __マスアダプションを目指して__
navraは広く一般の釣り人に使ってもらえるweb2.5サービスとなることを志向しており、クリプトの送金やウォレットの作成が不要になるような設計に重きを置きました。具体的な工夫としては以下の２点です。
- [web3auth](https://web3auth.io/)
  - オンボーディングにおいてはこれまでのアプリと違和感のないフローとなるよう、web3authによる認証を行い、秘密鍵/アドレスを生成、分散管理する。
- [Biconomy](https://www.biconomy.io/)
  - ユーザ間でのトークンのやりとりなど、具体的にクライアントからのトランザクション発生が想定されるケースに対し、ガスレス(メタ)トランザクションサービスであるBiconomyを経由する


#### __コントラクト標準(ERC)の選定__
３種のFT、複数のNFTを同時に扱う必要があるため、**ERC1155**を採用しました。各トークンの具体的な特徴に関しては、以下表をご参照ください。

|  | NVR | NCT | tNVR | Record NFT |
|:---|:---:|:---:|:---:|:---:|
| トークン種別 |FT |FT |FT |NFT |
| 発行上限量 |10億 |∞ |∞ |1 |
| 譲渡 |○ |× |× |× |
| 焼却 |× |○ |○ |○ |

- NVR
  - 釣果投稿によってユーザに還元される換金性のないトークン。上限を設定しているのは、10年程度を目処にほとんどがユーザ間での流通に移行し、ブルーエコノミーなども視野に入れた価値交換に使用されることを想定しているため。
- NCT
  - 釣り場ごとにプールされ、法定通貨相当として消費される際にバーンされるトークン。当面の間はその用途を含めて運営サイドが管理し、いずれは執行も含めてDAO化することが理想と考える
- tNVR
  - アカウント作成時に付与される、オンボーディングのためのトークン。譲渡は不可能であり、サービス機能の利用によりバーンされる。
- Record NFT
  - エリア最大記録の更新時や、新しい釣り場への訪問時にPOAPのように付与されるNFT。さまざまな活用法が考えられるが、NVRのように量的にはかることのできな貢献や労力に対して付与される。




## 🖌 Mockup
サービスはネイティブアプリケーションを想定しています。今回はクライアントの実装までは至っておりませんが、重要な機能を実現するUIの設計を行いました。アニメーションつきでログインから釣果投稿までの流れを体験していただけます。　※PCでの閲覧を推奨

[👉 __Figmaのモックアップ__](https://www.figma.com/proto/8YqMWlJ3krgnhhh4OzXdRe/navra.fish?type=design&node-id=220-8&viewport=4398%2C-6299%2C0.27&t=VFejGbaxCrm7SZZR-0&scaling=contain&starting-point-node-id=1675%3A23090&show-proto-sidebar=1)

  

## 🔖 Usage
#### Installation
```shell
git colne https://github.com/bussealle/navra-akindo
npm install
```
#### Test Contracts Local
```shell
npx hardhat test
```

#### Deployed Contracts
- 0x2baf10605ea7d718e3fe68ad1b4cb26ae9edef4a
  - [on polygonscan](https://mumbai.polygonscan.com/address/0x2baf10605ea7d718e3fe68ad1b4cb26ae9edef4a)

#### Metadata API
- JSON example
  - [demo api server](https://navra.fish/metadata-api/token/0000000000000000000000000000000000000000000000000000000000000003.json)
  - [demo image](https://navra.fish/images/11340390.png)


#### Deploy Contracts (If you needed)
```shell
// to Local
npx hardhat run scripts/deploy.js --network localhost
// to Mumbai Testnet
npx hardhat run scripts/deploy.js --network matic
```
#### Test Client (If you needed)

```shell
cd client
touch .env //for private key
echo "YOUR PRIVATE KEY" >> .env //
npm install
npm run dev //http://localhost:3000
```

## 🌐 Token Economy
トークンエコノミーの概要図になります。
![jpg](https://github.com/bussealle/navra-akindo/blob/main/image/navra_tokeneconomy.jpg)

## 📈 Simulation
![gif](https://github.com/bussealle/navra-akindo/blob/main/image/navra_machinations.gif)

ユーザの増加関数や各種価格を仮定して、トークンの流通量およびサービスとしての売上を想定するラフシミュレーションを行なっています。ご興味があれば、以下URLからご参照ください。

[👉 machinationsでのシミュレーション](https://my.machinations.io/d/navra-token-economy/bda3d8af414111ed8c2902f943517e50)

# 🗓 TO DO
- ネイティブアプリ
  - また今回は検証のためのクライアントアプリをNextJSで実装しましたが、ネイティブの実装に関しては多くの課題があると考えています。ネイティブ向けのSDKやセキュリティに関してはまだ整備途上のものも多く情報が少ないため、どこまでをweb3ライクにするかを含めてアップデートを続けてまいります。
  
  
- ブロックチェーン
  - 規制の中であえてブロックチェーンを使う意図としては、主にデータの透明性による信頼性の向上、およびデータ二次利用の促進がありますが、将来的なNVRの上場も可能性としてはあると考えています。なおその際、本当にパブリックチェーンが適しているかどうかは検討の余地があると考えています。  
  

- データの真正性
  - GameFiで問題となるデータの真正性に関しては、アプリ内カメラによる投稿に限定することによって、位置情報による状況判定、対象物の画像認識による魚種判定、(願わくば)デュアルカメラによるサイズ判定の３点によって達成されるものと考えています。またユーザに付与されるNVRは換金性がないため、不正を行う動機は乏しいと考えていますが、今後は画像認識モデルの検証や、インセンティブ付与によるクラウドソーシングの仕組みも検討してまいります。


___
## Author
kakadudu  ([twitter](https://twitter.com/navra))

shzo ([twitter](https://twitter.com/shzo_hara))


## 📙 Licence

[MIT](https://github.com/kotabrog/ft_mini_ls/blob/main/LICENSE)
