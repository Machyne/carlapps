json.array!(@nnb) do |nnb|
  json.extract! nnb, :type, :content, :contact, :appeared, :date
  json.url nnb_url(nnb, format: :json)
end