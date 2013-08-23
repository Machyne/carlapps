class Nnb
  include Mongoid::Document
  field :type, type: String
  field :content, type: String
  field :contact, type: String
  field :appeared, type: Array
  field :appearedIndex, type: Array
  field :date, type: Date

  def self.sort_by_index(arr, date)
    arr.sort do |a, b|
      inda = a.appeared.index(date)
      indb = b.appeared.index(date)
      a.appearedIndex[inda] <=> b.appearedIndex[indb]
    end
  end

  def to_ko
    {:type => type, :content => content, :contact => contact, :appeared => appeared, :date => date}
  end

end
