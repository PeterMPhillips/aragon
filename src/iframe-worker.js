import EventTarget from '@ungap/event-target'

class IframeWorker extends EventTarget {
  constructor(scriptUrl, { name }) {
    super()

    this.name = name
    this.iframe = document.createElement('iframe')
    this.iframe.sandbox = 'allow-scripts'
    this.iframe.style = 'position: absolute; width: 0; height: 0; opacity:0;'

    const source = `
      <script>
        const fetchScriptUrlAsBlob = async url => {
          // In the future, we might support IPFS protocols in addition to http
          const res = await fetch(url, {
            method: 'GET',
            mode: 'cors',
          })
          // If status is not a 2xx (based on Response.ok), assume it's an error
          // See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
          if (!(res && res.ok)) {
            throw res
          }
          return res.blob()
        }
        async function getObjectUrlForScript(scriptUrl) {
          const blob = await fetchScriptUrlAsBlob(scriptUrl)
          return URL.createObjectURL(blob)
        }
        const init = async () => {
          let workerUrl = ''
          try {
            // WebWorkers can only load scripts from the local origin, so we
            // have to fetch the script (from an IPFS gateway) and process it locally.
            //
            // Note that we **SHOULD** use a data url, to ensure the Worker is
            // created with an opaque ("orphaned") origin, see
            // https://html.spec.whatwg.org/multipage/workers.html#dom-worker.
            //
            // The opaque origin is a necessary part of creating the WebWorker sandbox;
            // even though the script never has access to the DOM or local storage, it can
            // still access global features like IndexedDB if it is not enclosed in an
            // opaque origin.
            workerUrl = await getObjectUrlForScript('${scriptUrl}')
          } catch (e) {
            console.error("Failed to load ${name}'s script (${scriptUrl}): ", e)
            return
          }
          const worker = new Worker(workerUrl, { name: '${name}' })
          worker.addEventListener('error', error => window.parent.postMessage({ from: '${name}', error }, '*'), false)
          worker.addEventListener('message', event => window.parent.postMessage({ from: '${name}', msg: event.data }, '*'), false)
          window.addEventListener('message', ({ data }) => worker.postMessage(data))
          // Clean up the url we created to spawn the worker
          URL.revokeObjectURL(workerUrl)
        }
        init()
      </script>
    `
    this.iframe.srcdoc = source
    document.body.appendChild(this.iframe)

    window.addEventListener('message', this.handleIframeMessage, false)
  }

  postMessage(msg) {
    if (this.iframe) {
      this.iframe.contentWindow.postMessage(msg, '*')
    }
  }

  terminate() {
    window.removeEventListener('message', this.handleIframeMessage)
    if (this.iframe) {
      this.iframe.remove()
    }
    this.iframe = null
  }

  handleIframeMessage = event => {
    const {
      source,
      data: { from, error, msg },
    } = event
    if (source === this.iframe.contentWindow && from === this.name) {
      this.dispatchEvent(
        new MessageEvent(error ? 'error' : 'message', {
          data: error || msg,
        })
      )
    }
  }
}

export default IframeWorker
