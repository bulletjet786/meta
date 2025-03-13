
export function defineWc(name: string, wc: CustomElementConstructor) {
    // Define the web component
    if (customElements.get(name)) {
        console.log(`${name} has been defined, skiped`)
        return;
    } else {
        console.log(`${name} will be defined ...`)
        customElements.define(name, wc)
        console.log(`${name} has been defined`)
    }
}
