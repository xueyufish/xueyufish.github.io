---
layout:     post
title:      "详解业财一体化，从入门到搞通"
description: "详解业财一体化（业务财务一体化）从入门到落地：核心概念、主数据模型、核算规则、凭证自动化、报销/应收应付/成本归集、ERP 与业务系统打通，实现业务财务数据闭环与实时核算。"
date:       2026-05-01
author:     "yuxiumin"
keyword:    "业财一体化, 业财融合, 业务财务一体化, ERP, 财务系统, yuxiumin"
tags:
    - 架构设计
    - 业财
    - 业财一体化
---

***转自： [详解业财一体化，从入门到搞通](https://mp.weixin.qq.com/s?__biz=Mzg2MTg1NTM4NA==&mid=2247513590&idx=1&sn=778daa72e3f062fd5a18f6cb1ea0a65f&chksm=cf811838d6ea03c079892da0c9cd68e1301353713116ef2119a3ee91b1878e194fd957b99638&mpshare=1&scene=1&srcid=0417JzGY0KigcHCVBMvQprs0&sharer_shareinfo=5defdad0fa76805cb4704c4ffadb1e1f&sharer_shareinfo_first=5defdad0fa76805cb4704c4ffadb1e1f#rd)***

想象一个这样的场景：

每个月底，财务的结账邮件准时如闹钟般响起：200 多张数据报表，按部门、按业务、按系统逐一摊开，每张背后都站着一个被催促的业务负责人。

运营从系统里导出商家结算表，上百个字段，逐行核对、加工、提交。财务审核，资金部门批量付款。一圈走完，小半个月过去了。

这不是某一家公司的故事，而是绝大多数企业的日常。直到有一天，财务问了一句：你们能不能月底自动生成凭证？金蝶有接口。

这句话背后，藏着一个更大的命题：业财一体化。一个至少需要20篇万字长文才能讲透的主题，不过内容再多，只要一点一点切入、一块一块展开，总能从入门到精通。

## 一、初识业财一体化

所谓业财一体化，可以从三个字来拆解：业、财、一体化。

![](https://mmbiz.qpic.cn/mmbiz_png/JlhkdqxYmCGGJIa4SxVUzJ8JV4KqeHzBx4CjZkeVJGic2ySgVAB9ZmWpEHTly5uJhBYOM8EL3zI9bxmmicy7NMLAXvNQnuTWxtmsWCdolaY6A/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0)

### 1.1 "业" 就是业务活动
一个企业的存在，需要通过采销的经营活动不断获取营收：采购原材料或者服务，经过生产加工成商品再卖出去获取利润。

在整个业务发展过程中存在着非常多的业务，例如采购原材料、原材料入库、加工生产、商品入库、销售、营销等等。不同的业务需要不同的人员参与管理，同样不同的业务有不同的业务流程，不同的业务流程又包含着不同的业务环节。

### 1.2 "财" 就是财务活动
一个企业经营的好坏，赚了多少，赔了多少，需要财务数据进行反映。同样，企业的全部业务都需要进行财务数据的记录。

业务流程中也都有财务参与的影子，比如营销的预算需要财务进行审批。所以，业务跟财务是紧密联系在一起的，相互关联、相互依赖、互为支撑。业务流程中包含了财务的流程，同样财务的数据来源于业务，谁也离不开谁。

### 1.3 "一体化" 就是融合
业财一体化就是业务跟财务的融合。业务和财务本身互为联系，但二者的这种联系却有多种形态：

在数字化盛行之前，业务跟财务通过线下联系，可能业务和财务都是线下发生的，线下下单，线下发货，纸质的入库单、采购单；财务也是纸质的账簿、纸质凭证。

慢慢随着互联网的发展，业务逐渐线上化，电子商务、电子支付盛行以后，基本采销都可以实现线上进行，包括入库、发货等都可以实现线上数据传输，不再依赖线下的各类纸质单据。

同样财务也实现了线上化、软件化，像用友、金蝶、SAP 等软件中的财务软件部分可以很好地对财务业务进行数据化管理，电子凭证、电子账簿等应运而生。

以上三点可以高度概括业财一体化，打开业财一体的大门。

## 二、业财一体的三点认知

业务是非标准化的，不同的领域、不同的公司、不同的部门、不同的系统都各不相同。财务是标准化的，有严格的会计准则和法律法规，这也是为什么有全球通用及国内主流的会计软件的原因。

大部分企业的业务是业务，财务是财务，业务按照财务要求提供数据报表完成记账。而业财一体，让业务和财务在数据层打通了。

### 2.1 从业务到财务的连接器

怎样将非标的业务与标准的财务连接起来呢？

这就是业财一体的链接模型，从各种形状的口转换成财务的方口。

![](https://mmbiz.qpic.cn/mmbiz_png/JlhkdqxYmCFyne7kVY9yES8bAv9sNfHlcD20suC6H02o7439UV66rZ0AuYxhN2FEcKC9JmcUWQy2WuicZ9KlAl1U2lkic2OA7icQZ9LkpRLtpk/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1)

业务像各种形状的插头，圆的、扁的、方的、不规则的；财务像一个标准化的插座，方方正正，规格统一。业财一体的本质，就是做一个转换器，把各种形状的业务插头，接上财务那个标准化的接口。

### 2.2 业财5点模型，把握落地路径
从"圆口到方口"是从信息化系统层面对业财作用的抽象。而要完整地把握业财一体，或者说是去接手一个业财一体的项目，还应该再增加2点认识，构成5点模型：

![](https://mmbiz.qpic.cn/mmbiz_png/JlhkdqxYmCHlpqove4BuNAV6vQaEDHKdPTwchpianFlAYERQichKE94Uo51DgagbCgibGyyp6sUic1sarSks3gSYibh5e06aAntQbCM6R1oVthmI/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=2)

**1）为什么要做业财一体**

不同行业、不同公司、不同部门和人员，目的各不相同。要想做好业财一体并顺利推进，就要了解各个角色的需求是什么：

- 公司想上市，需要业财一体的数据支撑合规披露
- 老板要通过业财一体吸引投资人，数据透明、经营可视是最好的故事
- 财务想改变手工做账，提高工作效率，降低差错率
- 业务想摆脱财务对业务的牵制，打通关键数据，提升响应速度
- 产研也有自己的需求，统一数据口径，减少系统间的数据孤岛

当然，这是个决定要做就困难重重的项目。每个部门每个人都有自己的小九九，业务要投入资源配合你，财务害怕你优化掉了他们的饭碗……总之，知己知彼，事情总会更顺利一些。

**2）如何实施，开展工作**

要开始做业财一体，怎么下手，如何落地？这里给大家一个参考路径。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/JlhkdqxYmCExjrfbGd6iaDoia4J24ibKGPyOrMLGlNuqibAY3HNcZwXWqUjpJSzEG4Z01XrjABOha7CAXLsmcppaIuMG2Nr5FwEMOa6NCULWAfE/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=3)

### 2.3 选好切口，打通数据

业财连接，从哪里连接？你要数据，我给你什么数据？

从业务到财务，也是条条大路通罗马。既然要做业财一体，那么财务那一头至关重要，它就像一个水库。业务的水要灌进去，是打通一个管道直联水库，还是建立一个车队长途运输？

目前市面上有成熟的业财一体化解决方案：企业可以选择将订单、支付、报销、合同等业务及数据直接对接解决方案的相应模块，灌入数据，自动实现业财一体。这是业务的连接，业财的自动化实现。

![](https://mmbiz.qpic.cn/mmbiz_png/JlhkdqxYmCHsUSIhYtCRfSZRIfeNMNicV0RH4tQK0GTeGmbHjsZBKVJePaoiboxFu4qYzXiaZJnBrfDs6RZcnAcTpiaxpPyXcNTJu7NknUu6cMQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=4)

当然，每一个解决方案模块都有成本。全局采购不是一般企业可以承受得了的：例如采购模块、生产计划、车间管理、财务管理、仓储管理、销售管理、人力资源管理等，全部上马的费用可想而知。

所以，还有一种方式就是：直接连接财务模块，业务自研。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/JlhkdqxYmCF6Vrib5IPAibDuIsarEGG4Bm2EZhHBqvWPMCWCibjDcdib4SURaS7OGBe6pmE4g5H81ibyENcwTyd886ZrCgBxibUibA6wlPVqBoThms/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=5)

直接将业务数据转换成财务凭证数据，对接财务模块，业务部分保持自研系统。这就是在中间的转换环节做好数据转换——也就是会计引擎。

## 三、从业务到会计引擎

要想实现业务和财务的高度融合，实现数据打通，提高业务和财务的双向互动，建立起业财链接，就必须搞清楚会计引擎了。

先看一个真实的实例。

在没有实现业财一体之前，我是怎么跟财务合作的：每月底会收到财务的结账通知邮件，邮件中包含了200多张数据报表需求，按部门、按业务、按系统提供，每张报表后有提供负责人。

其中有一张报表叫"薪资表"，本质上是商家的收入结算表，记录了全部商家在A业务线的全部收益明细，最后计算本月应付其最终收入。这张表有上百个字段，记录了每一个个人商家接单数量、单价、总价、优惠补贴、奖惩等一系列费用明细汇总。

次月初由运营人员从系统中导出该数据报表，进行数据核对以及加工处理，然后提供给财务。财务进行内部的应付款审核流程，完成全部审批以后，提供给资金部门进行批量付款。以此，整个结算付款流程才算结束。

同样，这张报表也是财务生成会计凭证的原始业务数据依据。报表中的订单收入、营销补贴、奖金罚款等涉及到几十项费用，也就会生成几十张会计凭证。

突然有一天，财务说金蝶有凭证接口，问我们能不能在月底实现自动生成凭证，他们审批通过以后直接提交给金蝶系统，这样就省掉了线下大量的数据处理、管理、审批流程了。

这个需求里就体现了几个关键的问题：

哪些业务数据可以实现自动化？哪些会计凭证可以自动生成？业务在哪里转换成会计凭证？什么时候转换？转换成什么科目？哪些业务数据转换成凭证的什么字段？怎么查看转换后的凭证？何时推送金蝶生成正式凭证？

这一系列问题，就是会计引擎要解决的问题。它作为业务和财务的连接器，实现业务数据向会计数据的转变，实现原始凭证向会计凭证的转变。

### 3.1 什么是会计引擎
会计引擎就是业务数据向财务数据转换的翻译器，通过一系列的转换规则和业财数据映射关系，将不同的业务数据转换成预制会计凭证。

![](https://mmbiz.qpic.cn/mmbiz_png/JlhkdqxYmCFHAMu0csMGp2fWOibiarzPictXwP57KpNXhntDXibmYD1Ah4mCeGv5RBziaBHlw59e23lADtA37kRiaZ7zMDRWQq7sa9icKMcUvzLA6s/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=6)

打个比方：业务讲的是方言，财务听的是普通话。会计引擎就是一个实时翻译官：
业务那边喊一声音"女装上衣卖了100件"，这边财务立刻收到"借：应收账款，贷：主营业务收入——服装类/女装，100件，单价XX，金额XX"。

### 3.2 业务流程与业务数据
不同的企业往往有不同的业务流程。比如纯互联网企业与加工制造企业在业务流程上有特别大的差异，相同的企业在相同事务上的业务流程也有巨大差异。

梳理清楚企业的业务分类以及业务流程非常重要，并且要弄清楚业务流程与财务流程的融合之处，以及流程中所产生的会计凭证是什么。

但无论什么样的企业，在大的流程分类上具有相似性，比如采购付款、销售收款、费用报销、员工薪酬、固定资产等流程。

**1）采购付款流程**

企业需要向上游供应商采购原材料或者服务，通过内部加工生产成商品或者服务产品销售给终端客户获取利润。而采购的过程就需要向供应商进行付款，这个过程是收获了原材料、支付货款的过程。

![](https://mmbiz.qpic.cn/mmbiz_png/JlhkdqxYmCH6sqzKiaJ0w3kJIa3ibJC5Ww3XktHAn3YPfx4m9yhPQXKyiab9KWLib10rZL7K6FkzWnhMSjmSx817VQ2VqnY6npvTFXPYbNSUca4/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=7)

过程中不仅要与供应商签订采购合同，还需进行采购发票的处理以及支付付款处理。所以产生了采购订单、采购发票、原材料入库验收单、付款单等一系列业务数据，这些数据也将作为应付款凭证以及付款凭证的原始依据。

**2）销售收款流程**

企业通过内部转换将原材料加工成商品或者服务，销售给客户，客户支付货款。企业向客户发货或者提供上门服务以完成合同履约，客户确认收货或服务完成后索取发票，企业即可确认收入。

![](https://mmbiz.qpic.cn/mmbiz_png/JlhkdqxYmCH2lNphl5f4tH4Ye3HdwQSklOdCR81JHJDb9icsWBNcjw4Mc5Fd6VserXZ8dCrBOfDROicJGYA7Y6JZsBoomMibdYPyhOOZqSBNxA/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=8)

这个过程中会产生销售订单数据、用户支付数据、服务履约数据、销售发票数据等业务数据，同样这些数据也将作为收入凭证的原始数据依据。

**3）费用报销流程**

相比大家都出过差。有段时间我经常去长沙出差，流程大概是这样的：

首先在OA系统提交出差申请单，然后在携程商务中订购机票，领导审批完成以后出票；到了出差地订购酒店，并且每顿饭一定索要发票用以后续的报销。

等出差回来以后在OA系统提交报销单，写明报销事项（比如住宿、餐费等），并将报销单关联出差申请单，提交以后还需要将纸质发票贴好提交到财务指定位置。这时候就可以在OA系统查看报销流程了——如果报销单没有问题，提交的发票也没有问题，财务审核通过以后就会将报销款直接付款到工资卡中。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/JlhkdqxYmCHTjsOcaI1baQGicfxtl6Grc3dtZSgLQN95hlbDI7gTiaI1sI0icSVGZBp6ARLwdiaAmpCaCUTY6GJhATJOszKBQ9aD3wN7AAnT5lk/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=9)

整个过程从出差申请、机票与酒店预订、报销提交都是线上化操作，不再像以前一样需要填纸质申请单和报销单、自己垫资购买车票和酒店费用。线上化的申请流程和报账流程让整个费用报销效率极大提升，员工体验也得到极大提升，当然财务的工作量也降低到了最小。

**4）员工薪酬流程**

每月薪资结算涉及基本工资、绩效奖金、社保公积金、个税代扣、津贴补贴等数十项明细，每项对应不同的会计科目和费用归属部门，同样是会计引擎最典型的应用场景之一。

从上述列举的流程中可以发现：业务流程中会产生大量的业务数据，而且业务流程依赖企业信息化系统完成，线下业务很难实现与财务的链接和融合——企业信息化是业财一体的前提条件。

而业务流程中的业务节点会产生不同类型的会计凭证，这就为实现从业务数据向会计数据自动化转换提供了模型依据。同样，要能够识别这些业务流程及业务节点，还要能够将这些结构化的业务流程与会计凭证类型建立联系。

接下来将对业务数据与结构、凭证类型、凭证结构、会计引擎基础数据、映射规则、凭证模板、案例分析等内容进行解析。

## 四、会计引擎
在企业经营中，财务人员通过会计凭证记录企业的经济活动，并依据会计凭证登记账簿。传统的财务工作中，会计人员根据纸质的原始凭证，依赖财务工作经验编制分录并录入到账务系统中。

当企业业务复杂、数据量大时，完全依赖财务人员人工处理，效率低且正确率难以保证。

所以，由业务数据实现自动化账务处理势在必行。但是企业的业务数据一般为颗粒度更细的明细数据，而财务数据则是需要符合会计准则的数据，因此必须先将业务数据向财务数据进行转换。会计引擎则可以帮助解决此问题。

基于以上背景，可以把会计引擎理解为一个翻译工具——需要提前将翻译规则预设好，然后输入业务语言，便可按照预设的规则，输出对应的财务语言。也就实现了业务数据到财务数据的转换，最终生成预制凭证。

### 4.1 如何搭建会计引擎
首先要明确，会计引擎的目的是实现账务自动化，即由业务数据自动生成会计凭证。那么可以从会计凭证出发，倒推出生成一个会计凭证都需要什么内容，从而明确会计引擎的构成。

市面上比较常见的会计核算系统有金蝶、用友、SAP、Oracle，不同会计核算系统的凭证格式不同。下面以用友NC生成的凭证为例，一张凭证的主要内容包括：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/JlhkdqxYmCFjdmXSJOiapaSvVwejR26tqBmcvbZqGmEL4W2iaPdeG9VeS6cbfJgia41icIic5NPxtw9drA3Gd1RjXDB0Tww7flu72xJ3xMh13LPM/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=10)

可以看出，凭证是有一定格式的，并且部分内容无法从业务数据中直接获取。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/JlhkdqxYmCG9Mc0aKpTkyico1ISFSpoTZNQcwTZw6C0PYXpq6VqAaCDWPtXofeLhHRTRFxxvNLibhvCRHbLghIqOUpF0DicJMAQ26H9frYvzTI/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=11)

基于以上，会计引擎应具备的主要功能为：
- 对于直接能找到业务数据与凭证内容对应关系的，根据规则进行映射，直接转换。
- 对于无法找到业务数据与凭证内容直接关系的，则要根据规则对业务数据进行加工计算，再得到凭证需要的结果。

总结来说，会计引擎首先需要预设规则，然后调用相应规则执行转换。

![](https://mmbiz.qpic.cn/mmbiz_png/JlhkdqxYmCGbXU2sgMIMC8nxanjYSVOZfx6iayBehBBUUcDcmUGn3C33WnPxnGBEKXWyIWonfloTlAr0fIy1HsWbMv6WtP1t78pCmQakYUnI/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=12)

### 4.2 会计引擎的规则
以上面凭证举例，简单列举几个想要生成这张凭证应配置的规则：

核算账簿的取值规则、制单日期的取值规则、会计期间的取值规则、借贷方向的生成规则、摘要的生成规则、会计科目的生成规则、辅助核算项的取值规则

那么这些规则具体又是如何构成的呢？

规则的组成是：条件语句和结果语句。这放在会计引擎当中依旧适用。会计引擎规则中的条件语句由业务数据组成，结果语句则由财务数据组成。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/JlhkdqxYmCG8vWLv2NcaMLyIQa2cZyrRE9x0UrZFNLfxpAgdUBTNxp4JqxmAys0Aqeq5ibna7S71AwWpaHZvIibO6eibVOfEXNVh9yzib0aHVfI/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=13)

多条件组合示例：

![](https://mmbiz.qpic.cn/mmbiz_png/JlhkdqxYmCFwAu5rRluPPTzYmE4RSrn50sRdJIMSNodjgG97xWUs9icaM7mCkdoaHL03We51G7IVZeXx1PhaVhLniccOoOibB1ibiaIFQT2Gwe8Y/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=14)

以上只是介绍了会计引擎规则的基本构成。具体规则内容，还需要结合公司具体的业务场景、业务流程以及账务处理方式等进行详细梳理。

### 4.3 会计引擎的规则配置

尽管不同公司、不同业务的会计引擎内容大不相同，但配置页面万变不离其宗。

考虑到需要配置的规则数量大、适用场景多，在实际应用中可以在规则的结构上增加一级——"规则类型"，以便管理和配置。通过维护规则类型，限定每类规则可以使用的条件和结果因子，缩小配置规则时的选择范围。

下面举例一个简单的模型，这里默认条件和结果之间的判断词为 "则"，同一规则各条件、结果之间的组合逻辑均为 "且"。即：如果 "条件1" 且 "条件2"，则 "结果1"。

![](https://mmbiz.qpic.cn/mmbiz_png/JlhkdqxYmCEwhcLbqNFib42Sq9X1Sr94lIRuEzm0cC0JpecGa3ySVhvZIsEIc0ssHN0xxic9MkaAPoRKHyBXrY498KmbwD1pmGUuYHKfWVKwE/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=15)

1）规则类型管理原型页面

![](https://mmbiz.qpic.cn/sz_mmbiz_png/JlhkdqxYmCFv4Ym8fv3dB0GulEWLA39dp0pSfJzWep3icuqDU7fyQWcib1XcjG1unle2hBrxYXQFohmrelSYXWr3dZwoNLznkibnC5Nico30xO8/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=16)

所属组织：用来限定当前规则适用的组织范围

条件因子和结果因子：数据库内已有的字段，用户通过选择的方式任意添加（条件和结果至少各一个），即指定该种规则类型对应可选的条件或结果

2）规则管理原型页面

![](https://mmbiz.qpic.cn/sz_mmbiz_png/JlhkdqxYmCGbMvdWaWqTcpczGVibNbKfmQtsa9h7r2bDOKF4SJ9kpa8vsto0rEU0wuibrX7ib9Z0WmBBXDSpUZQUJj3KTNOcDy7BlBJPRfiaNz4/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=17)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/JlhkdqxYmCGR6qicjsUVmhq9YJ3HPiaeEdK3OsWApIzzuPMO3NQfuNXTeicxSRRB83yHTWhWjZr5N6ClMKErMROnnkbNNibaYLQwk3sl1hWicrNk/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=18)

每条规则都需要选择已有的规则类型

条件、结果下拉列表中带出的条件因子和结果因子，会根据已选择的规则类型决定

可添加多个条件和多个结果

条件因子的值、结果因子的值，即所选条件和结果因子对应的枚举值

以上会计引擎的功能模型、原型页面等都是最简单的逻辑。在实际应用当中，需要根据业务复杂程度、用户个性化要求、服务器性能等再做相关设计。

## 五、写在最后
业财一体化是一个非常大的主题，可能需要至少20篇万字长文才能够详尽其所以然。不过内容再多，只要一点一点切入、一块一块展开，总能从入门逐渐到精通。

从"业务是圆的、财务是方的"，到"会计引擎如何把圆口接上方口"

这篇只是开了个头。真正的难点从来不是技术实现，而是业务梳理的深度、规则设计的精度、以及推动落地的魄力。