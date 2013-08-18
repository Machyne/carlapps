class Nnb
  include Mongoid::Document
  field :type, type: String
  field :content, type: String
  field :contact, type: String
  field :appeared, type: Array
  field :date, type: Date
end
