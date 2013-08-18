Carlapps::Application.routes.draw do
  root :to => 'bulletin#index'

  # For NNB Posts / Snippets
  get '/nnbs' => 'nnbs#index'
  post '/nnbs(.:format)' => 'nnbs#create'
  patch '/nnbs/:id(.:format)' => 'nnbs#update'
  put '/nnbs/:id(.:format)' => 'nnbs#update'
  delete '/nnbs/:id(.:format)' => 'nnbs#destroy'

end
