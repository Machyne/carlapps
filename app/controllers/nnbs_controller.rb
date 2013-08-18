class NnbsController < ApplicationController
  before_action :set_nnb, only: [:show, :edit, :update, :destroy]

  # GET /nnbs
  def index
    query = {}
    ['appeared','contact','content', 'date','type'].each do |k|
      query[k] = params[k] if params[k]
    end
    query = hkeys_to_sym(query)
    p query
    @nnbs = if query.empty?
              Nnb.all
            else
              Nnb.where(**query)
            end
    render json: {nnbs: @nnbs.map{ |n| n.to_ko }}
  end

  # POST /nnbs
  # POST /nnbs.json
  def create
    @nnb = Nnb.new(nnb_params)

    respond_to do |format|
      if @nnb.save
        format.html { redirect_to @nnb, notice: 'Nnb was successfully created.' }
        format.json { render action: 'show', status: :created, location: @nnb }
      else
        format.html { render action: 'new' }
        format.json { render json: @nnb.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /nnbs/1
  # PATCH/PUT /nnbs/1.json
  def update
    respond_to do |format|
      if @nnb.update(nnb_params)
        format.html { redirect_to @nnb, notice: 'Nnb was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @nnb.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /nnbs/1
  # DELETE /nnbs/1.json
  def destroy
    @nnb.destroy
    respond_to do |format|
      format.html { redirect_to nnbs_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_nnb
      @nnb = Nnb.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def nnb_params
      params.require(:nnb).permit(:type, :content, :contact, :appeared, :date)
    end

    def hkeys_to_sym(my_hash)
      if my_hash.class == Hash
        my_hash.inject({}){|memo,(k,v)| memo[k.to_sym] = hkeys_to_sym(v); memo}
      else
        my_hash
      end
    end
end
