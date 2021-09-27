import { init } from './init.js'
import { eventListenerModule } from './modules/eventlistener.js'
export const patch = init([eventListenerModule])
