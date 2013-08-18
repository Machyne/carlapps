class NnbsController < ApplicationController
  before_action :set_nnb, only: [:show, :edit, :update, :destroy]

  # GET /nnbs
  def index
    @nnbs = Nnb.all
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
end
