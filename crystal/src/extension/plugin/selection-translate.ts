import { IPlugin } from "./plugin";
import {CrystalSelectionTranslatePanelWcName, defineSelectionTranslatePanelWc} from "../../components/CrystalSelectionTranslatePanel.tsx";

//该文件的代码是应用在网页页面上的，比如在页面上对文字的点击，选中网页上的文字等事件，如果这个文件里有写相应的事件，该文件里的代码则会被触发

/*翻译功能思路：
1.先用js创建一个div元素，他的innerHTML是翻译面板的HTML内容，把这个div挂载在页面上，但是默认是隐藏的（opacity:0），只有当用户选中了内容释放鼠标后才会显示
这个翻译面板（给div元素添加一个class，设置该状态的样式为opacity:1;）到这一步为止，显示在网页上的翻译面板的静态样式已经确定好。
2.翻译使用的是谷歌的免费接口 (https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh&dt=t&q='这里是需要翻译的内容')
接口中： sl = source language = 原文本内容的语言类型；tl = target language = 翻译后的内容的语言类型；q = 需要翻译的内容
3.监听鼠标的onmouseup事件，这个是当释放鼠标时会触发的，然后，通过webAPI中的 window.getSelection().toString() 获取到用户选中的
内容，如果用户没有选中任何内容，则return出去后续不做任何反应，如果有内容，则调用封装好的翻译函数，把选中的内容当作内容传递进去，把选中的内容和翻译好的内容
用innerText的方式插入到之前创建的div元素（翻译面板）对应的位置。
在这步同时可以获取到释放鼠标时鼠标所在的位置，把位置当作参数传给封装好的翻译面板位置设置函数
*/

// 写一个翻译面板的构造函数，可以通过它new一个翻译面板实例出来
/*
function Panel() {
    //实例化panel时，调用create函数（作用：在页面上挂载翻译面板的div元素）
    this.create()

    //调用bind函数（作用：绑定翻译面板上关闭按钮的点击事件）
    this.bind()
}

//在Panel的原型链上创建一个create方法(作用:生成一个div元素,innerHTML是翻译面板的HTML内容)
Panel.prototype.create = function () {

    //创建一个div元素,变量名叫container
    let container = document.createElement('div')

    //翻译面板的HTML内容 里面class为content的标签内的内容没有写,因为这里面的内容需要后面动态生成后插入,简体中文那里的content写了三个点是
    //是因为那里的翻译后的内容是异步获取的,在真正获取到内容前,把内容都显示成...做一个过渡
    let html = `
        <!--X是用来做关闭按钮-->
        <header>翻译<span class="close">X</span></header>
  <main>
    <div class="source">
      <div class="title">英语</div>
      <!--这里动态插入用户选中的需要翻译的内容 所以先留空 什么都不写-->
      <div class="content"></div>
    </div>
    <div class="dest">
      <div class="title">简体中文</div>
      <!--这里动态插入翻译后的内容,由于是异步获取,在获取到内容之前,先显示为...,否则如果当用户需要多次翻译时,在异步获取完成之前,内容会显示上一次翻译完成的文本-->
      <div class="content">...</div>
    </div>
  </main>
    `

    //刚刚创建的div元素里的HTML内容素替换成上面的内容
    container.innerHTML = html

    //给container添加一个class,查看content-script.css,这个class是最外层的div需要的class
    container.classList.add('translate-panel')

    //把container挂载到页面中
    document.body.appendChild(container)

    //把这个container当成一个属性赋值给Panel构造函数,方便后续对这个翻译面板进行其他操作,如替换面板中的内容
    this.container = container

    //把关闭按钮也赋值到Panel的属性close上
    this.close = container.querySelector('.close')

    //用来显示需要查询的内容
    this.source = container.querySelector('.source .content')

    //用来显示翻译后的内容
    this.dest = container.querySelector('.dest .content')
}

//显示翻译面板
Panel.prototype.show = function () {
    //container默认没有show这个class,默认样式是opacity:0;css中,如果container同时拥有show class,则opacity:1 取消隐藏
    this.container.classList.add('show')
}

//隐藏翻译面板
Panel.prototype.hide = function () {
    this.container.classList.remove('show')
}


//Panel函数绑定的事件.
Panel.prototype.bind = function () {
    //关闭按钮发生点击事件
    this.close.onclick = () => {
        //把翻译面板隐藏起来
        this.hide()
    }
}

//翻译功能函数 (参数raw的含义:用户选中的文本内容)
Panel.prototype.translate = function (raw) {
    //翻译前的文本内容
    this.source.innerText = raw
    //翻译后的文本内容(由于获取到翻译后的内容是一个异步过程,此时还没有开始翻译,先把翻译后的文本设置为...,后面等异步完成,获取到翻译后的内容后,再重新把内容插入进去)
    this.dest.innerText = '...'

    //用户选中的需要翻译的语言 如需要把英文翻译成中文,这里指的就是英文
    let slValue = 'en'
    //需要翻译成的语言 如需要把英文翻译成中文,这里指的就是中文
    let tlValue = 'zh-Hans'
    // })

    //查看用户是否已经设置了语言类型
    chrome.storage.sync.get(['sl', 'tl'], (result) => {
        if (result.sl) {
            slValue = result.sl.value
            this.container.querySelector('.source .title').innerText = result.sl.key
        }

        if (result.tl) {
            tlValue = result.tl.value
            this.container.querySelector('.dest .title').innerText = result.tl.key
        }

        //谷歌翻译接口 sl：需要翻译的语言（en 英语） tl：需要翻译成哪种语言 (zh-Hans 中文) q：需要翻译的内容
        fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${slValue}&tl=${tlValue}&dt=t&q=${raw}`)
            .then(res => res.json())
            .then(res => {
                //异步完成后,把获取到的已翻译完成的译文内容插入到翻译面板中
                this.dest.innerText = res[0][0][0]
            })
    })
}

//翻译面板在网页中显示的位置 传入的参数是一个pos对象,其中包含x,y
Panel.prototype.pos = function (pos) {
    //翻译面板用absolute定位，通过传入的鼠标光标位置参数设置面板在网页中显示的位置
    //设置翻译面板的top属性
    this.container.style.top = pos.y + 'px'
    //设置翻译面板的left属性
    this.container.style.left = pos.x + 'px'
}
*/

export class SelectionTranslatePluginOptions {
}

export class SelectionTranslate implements IPlugin {
    constructor(
        public options: SelectionTranslatePluginOptions
    ) {
    }

    name(): string {
        return "selection-translate"
    }

    init(): void {
        // 创建划词翻译面板
        defineSelectionTranslatePanelWc()

        const selectionTranslatePanel = document.createElement(CrystalSelectionTranslatePanelWcName);
        document.body.appendChild(selectionTranslatePanel);
        console.log("Selection translate panel inject finished.")
    }

}
