const { Component, createElement } = require("react")
const { sanitize } = require("sandhands")
let sandhandsOptions = require("sandhands/source/validate/allowedOptions")
sandhandsOptions = sandhandsOptions.primitives
  .get(String)
  .concat(sandhandsOptions.universal)

const inputOptions = ["onError"]
const allowedInputTypes = ['text', 'password', 'email', 'search']

class Input extends Component {
  constructor(props) {
    super(props)
  }
  interpretProps(props=this.props) {
    let sandhands = { _: String }
    let childProps = { ...props }
    delete childProps._hook
    let options = {}
    // Interpret the options from the props for sandhands
    if (props.hasOwnProperty('customFormat')) {
      if (typeof props.customFormat != 'string' || props.customFormat.length < 1) throw new Error('Custom Format Must Be a String!')
      sandhands._ = props.customFormat
      delete childProps.customFormat
    }
    Object.keys(props).forEach(prop => {
      if (sandhandsOptions.includes(prop)) {
        sandhands[prop] = childProps[prop]
        delete childProps[prop]
      } else if (inputOptions.includes(prop)) {
        options[prop] = childProps[prop]
        delete childProps[prop]
      }
    })
    if (typeof props._hook == "function") props._hook(this)
    // Get the input ref
    if (typeof childProps.ref == "function") {
      const propRefHandler = childProps.ref
      childProps.ref = ref => {
        propRefHandler(ref)
        this.input = ref
      }
    } else {
      childProps.ref = ref => {this.input = ref}
    }
    return {sandhands, childProp}
  }
  validateOptions(options=this.options) {
    const { vanilla, validate, onError } = options
    if (options.hasOwnProperty("vanilla") && typeof vanilla != "boolean") throw new Error("Vanilla must be a boolean value")
    if (options.hasOwnProperty("validate") && validate !== null && !(typeof validate == "object" || typeof validate == "function" || (Array.isArray(validate) && validate.every(value => typeof value == "function")))) throw new Error("Validate must be an object, a function, or an array of functions")
    if (options.hasOwnProperty("onError") && typeof onError != "function") throw new Error("onError must be a function")
  }
  sanitize() {
    if (this.useSandhands !== true) return
    if (!(this.input instanceof HTMLElement)) throw new Error("Can't find input ref!")
    try {
      sanitize(this.input.value, this.sandhands)
    } catch (error) {
      if (this.options.onError) this.options.onError(error.message)
      return error
    }
  }
  render() {
    const {options, sandhands, childProps} = Object.assign(this, this.interpretProps(this.props))
    this.validateOptions()
    return createElement("input", childProps)
  }
}

module.exports = Input
