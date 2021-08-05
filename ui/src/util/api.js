// Our API calls

// Common code to invoke a function if provided or a default action
const
  resultHandler = (f, h) => h ? h(f) : null,
  errorHandler = (e, h) => h ? h(e) : console.log(e);

// Here:
//  url = path of api request including inline parameters
// args = args to pass to fetch, e.g. post etc, null for plain get
//   rh = result handler, null/undefined for no handler
//   eh = error handler, null/undefined for no handler
export const
  // apiJsonCall raw API call expecting JSON response
  apiJsonCall = (url, args, rh, eh) => fetch(url, args)
    .then(res => res.json())
    .then(f => resultHandler(f, rh))
    .catch(e => errorHandler(e, eh)),
  //
  // apiRawCall will call rh only on a 200 response. eh on all others or error
  apiRawCall = (url, args, rh, eh) => fetch(url, args)
    .then(res => res.ok ? resultHandler(res, rh) : errorHandler(res, eh))
    .catch(e => errorHandler(e, eh)),
  //
  // apiLater runs the function later after 100ms delay
  apiLater = (func, delay) => setTimeout(() => func(), delay ? delay : 100),
  //
  // Status
  //
  // This will only invoke rh with a 200 response, eh on all other instances or error.
  // Value passed to rh will be the response NOT JSON.
  // Value passed to eh will be the response on !200 or error.
  apiStatus = (rh, eh) => apiRawCall('/api/status', null, rh, eh),
  //
  // Volumes
  //
  // List all volumes
  apiList = (rh, eh) => apiJsonCall("/api/list", null, rh, eh),
  //
  // List folder in volume
  apiListFolder = (vol, folder, rh, eh) => apiJsonCall('/api/list/' + vol + "/" + (folder ? folder : ""), null, rh, eh),
  //
  // Disk mounting
  //
  // Mount volume or disk in a volume
  apiMount = (path, rh, eh) => apiJsonCall('/api/mount/' + path, null, rh, eh),
  //
  // Unmount a volume or disk
  apiUnmount = (path, rh, eh) => apiJsonCall('/api/unmount/' + path, null, rh, eh),
  //
  // System
  //
  // apiSystemUpdate - Update Raspberry PI OS on the host
  apiSystemUpdate = () => apiRawCall('/api/system/update', null);
