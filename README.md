# navra

![jpg](https://github.com/bussealle/navra-akindo/blob/main/image/navra_top.png)


## 🎣 Overview(プロジェクト概要)
現在釣り人と釣り場関係者の関係性悪化により、日本中で釣り禁止のエリアが増えている。また釣り人同士にも競合関係があり、承認欲求に基づいた既存のSNS型釣果情報プラットフォームには、釣り人が求める正確で詳細な情報が集まっているとは言えない。 我々は上記の２つ問題を、

1. 独自のトークンエコノミー
2. サービスのユーティリティ
3. 釣りのゲーム性
   
以上３点の拡張で解決することを目指すnavraに釣果をアップすると、釣り場には換金性のあるトークン、釣り人側には換金性のないソーシャルトークンの２種類が同量発行される。釣り人は釣れば釣るほどその釣り場に貢献でき、その実績証明としてソーシャルトークンを得る。またアップされた正確な釣果/位置情報はトークン利用者に公開し、ユーティリティのある誠実な釣果情報サービスとして提供する。
(356字)


## 🛠 Tech stacks

![jpg](https://github.com/bussealle/navra-akindo/blob/main/image/navra_techstack.jpg)

## Mockup
サービスはネイティブアプリケーションを想定しています。今回はクライアントの実装までは至らず、重要な機能を実現するUIの設計を行いました。

※PCでの閲覧を推奨いたします。

[🖌 Figmaのモックアップ](https://www.figma.com/proto/8YqMWlJ3krgnhhh4OzXdRe/navra.fish?page-id=13%3A9&node-id=795%3A11988&viewport=-7234%2C-2636%2C0.28&scaling=scale-down&starting-point-node-id=795%3A11988&show-proto-sidebar=1)

  

## 🔖 Usage
#### Installation
```shell
git colne https://github.com/bussealle/navra-akindo
npm install
```
#### Test Contracts
```shell
npx hardhat test
```
#### Deploy Contracts (If you needed)
```shell
// to Local
npx hardhat run scripts/deploy.js --network localhost
// to Mumbai Testnet
npx hardhat run scripts/deploy.js --network matic
```


## 📈 Simulation
![gif](https://github.com/bussealle/navra-akindo/blob/main/image/navra_machinations.gif)

ユーザの増加関数や各種価格を仮定して、トークンの流通量およびサービスとしての売上を想定するラフシミュレーションを行なっています。ご興味があれば、以下URLからご参照ください。

[🖌 machinationsでのシミュレーション](https://my.machinations.io/d/navra-token-economy/bda3d8af414111ed8c2902f943517e50)




___
## Author
kakadudu  ([twitter](https://twitter.com/navra))

shzo ([twitter](https://twitter.com/shzo_hara))


## 📙 Licence

[MIT](https://github.com/kotabrog/ft_mini_ls/blob/main/LICENSE)