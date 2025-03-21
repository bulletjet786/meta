import { IPlugin } from "./plugin";

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

    /*翻译面板的HTML内容 里面class为content的标签内的内容没有写,因为这里面的内容需要后面动态生成后插入,简体中文那里的content写了三个点是
    是因为那里的翻译后的内容是异步获取的,在真正获取到内容前,把内容都显示成...做一个过渡*/
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

//实例化一个翻译面板
let panel = new Panel()

//划词翻译默认是关闭状态
let selectState = 'off'

//用chrome的storage接口，查看之前有没有存储 'switch' 这一项(查看用户之前是否已选择开启/关闭划词翻译功能,只要选择过,都会存储在switch里)
chrome.storage.sync.get(['switch'], function (result) {
    //如果有设置
    if (result.switch) {
        //把值(on / off)赋值给网页上翻译插件的状态变量
        selectState = result.switch
    }
});

//运行时，监听是否有数据传过来
chrome.runtime.onMessage.addListener(
    function (request) {
        // 如果有传 'switch' (当选项[开启]/[关闭]发生改变时,popup.js都会给当前活动标签页传递switch数据,也就是用户选择的选项是什么)
        console.log(request);
        if (request.switch) {
            //把用户修改的选项的值赋值给该变量

            selectState = request.switch
        }
    });

//监听鼠标的释放事件
window.onmouseup = function (e) {
    //如果用户选择的是关闭选项 就不显示翻译面板
    if (selectState === 'off') return

    //获取到用户选中的内容
    let raw = window.getSelection().toString().trim()

    //获取释放鼠标时，光标在页面上的位置
    let x = e.pageX
    let y = e.pageY

    //如果什么内容都没有选择，就不执行下面的，直接返回
    if (!raw) {
        return
    } else {
        //否则执行下面的内容
        //设置翻译面板的显示位置
        panel.pos({x: x, y: y})
        //翻译选中的内容
        panel.translate(raw)
        //把翻译面板在网页中显示出来
        panel.show()
    }
}

// 定义接口
interface Language {
    key: string; // 语言名称（如 "英语"）
    value: string; // 语言代码（如 "en"）
}

interface Pos {
    x: number; // 鼠标位置 X
    y: number; // 鼠标位置 Y
}

// 翻译面板类
class Panel {
    private container: HTMLElement;
    private close: HTMLElement;
    private source: HTMLElement;
    private dest: HTMLElement;

    constructor() {
        this.create();
        this.bind();
    }

    // 创建翻译面板
    private create(): void {
        const container = document.createElement('div');
        const html = `
            <main>
                <div class="source">
                    <div class="title">英语</div>
                    <div class="content"></div>
                </div>
                <div class="dest">
                    <div class="title">简体中文</div>
                    <div class="content">...</div>
                </div>
            </main>
        `;
        container.innerHTML = html;
        container.classList.add('translate-panel');
        document.body.appendChild(container);

        this.container = container;
        this.close = container.querySelector('.close')!;
        this.source = container.querySelector('.source .content')!;
        this.dest = container.querySelector('.dest .content')!;
    }

    // 显示翻译面板
    public show(): void {
        this.container.classList.add('show');
    }

    // 隐藏翻译面板
    public hide(): void {
        this.container.classList.remove('show');
    }

    // 绑定事件
    private bind(): void {
        this.close.onclick = () => {
            this.hide();
        };
    }

    // 翻译功能
    public translate(raw: string): void {
        let slValue: string = 'en'; // 默认源语言
        let tlValue: string = 'zh-Hans'; // 默认目标语言

        // 设置翻译前的内容
        this.source.innerText = raw;
        this.dest.innerText = '...';

        // 获取用户设置的语言
        chrome.storage.sync.get(['sl', 'tl'], (result: { sl?: Language; tl?: Language }) => {
            if (result.sl) {
                slValue = result.sl.value;
                this.container.querySelector('.source .title')!.innerText = result.sl.key;
            }
            if (result.tl) {
                tlValue = result.tl.value;
                this.container.querySelector('.dest .title')!.innerText = result.tl.key;
            }

            // 调用谷歌翻译接口
            fetch(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${slValue}&tl=${tlValue}&dt=t&q=${encodeURIComponent(raw)}`
            )
                .then((res) => res.json())
                .then((res: any[]) => {
                    this.dest.innerText = res[0][0][0];
                })
                .catch((err) => {
                    console.error('翻译失败:', err);
                    this.dest.innerText = '翻译失败';
                });
        });
    }

    // 设置翻译面板的位置
    public pos(pos: Pos): void {
        this.container.style.top = `${pos.y}px`;
        this.container.style.left = `${pos.x}px`;
    }
}

// 实例化翻译面板
const panel = new Panel();

// 监听鼠标释放事件
window.onmouseup = (e: MouseEvent): void => {
    if (selectState === 'off') return;

    // 获取选中的文本
    const raw = window.getSelection()?.toString().trim();
    if (!raw) return;

    // 获取鼠标位置
    const x = e.pageX;
    const y = e.pageY;

    // 设置翻译面板位置并显示
    panel.pos({ x, y });
    panel.translate(raw);
    panel.show();
};

export class LineTranslatePluginOptions {
	constructor(
		public contentSelector: string = "#game_area_description",
	) {
	}
}

export class LineTranslate implements IPlugin {

}