import { init } from './init.js'
import { domPropsModule } from './modules/domProps.js'
import { nativeEventListenerModule } from './modules/nativeeventlistener.js'
export const patch = init([nativeEventListenerModule, domPropsModule])
