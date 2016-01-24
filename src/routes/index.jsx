import React from 'react'
import { Route, IndexRoute, Redirect } from 'react-router'

// NOTE: here we're making use of the `resolve.root` configuration
// option in webpack, which allows us to specify import paths as if
// they were from the root of the ~/src directory. This makes it
// very easy to navigate to files regardless of how deeply nested
// your current file is.
import CoreLayout from 'layouts/CoreLayout/CoreLayout'
import NotFoundView from 'views/NotFoundView/NotFoundView'
import HomeView from 'views/HomeView/HomeView'
import LoginView from 'views/LoginView/LoginView'
import DocumentsView from 'views/DocumentsView/DocumentsView'
import DocumentView from 'views/DocumentView/DocumentView'

import { requireAuthentication } from 'components/AuthenticatedComponent'

export default (
  <Route path='/' component={CoreLayout}>
    <IndexRoute component={HomeView} />
    <Route path='login' component={LoginView} />
    <Route path='document' component={requireAuthentication(DocumentsView)}>
      <Route path=':docId' component={DocumentView} />
    </Route>
    <Route path='/404' component={NotFoundView} />
    <Redirect from='*' to='/404' />
  </Route>
)