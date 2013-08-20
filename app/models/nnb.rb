class Nnb
  include Mongoid::Document
  field :type, type: String
  field :content, type: String
  field :contact, type: String
  field :appeared, type: Array
  field :appearedIndex, type: Array
  field :date, type: Date

  def to_ko
    {:type => type, :content => content, :contact => contact, :appeared => appeared, :date => date}
  end

end
