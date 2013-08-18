class NnbController < ApplicationController
  before_action :set_nnb, only: [:show, :edit, :update, :destroy]

  # GET /nnb
  # GET /nnb.json
  def index
    @nnb = Nnb.all
  end

  # GET /nnb/1
  # GET /nnb/1.json
  def show
  end

  # GET /nnb/new
  def new
    @nnb = Nnb.new
  end

  # GET /nnb/1/edit
  def edit
  end

  # POST /nnb
  # POST /nnb.json
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

  # PATCH/PUT /nnb/1
  # PATCH/PUT /nnb/1.json
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

  # DELETE /nnb/1
  # DELETE /nnb/1.json
  def destroy
    @nnb.destroy
    respond_to do |format|
      format.html { redirect_to nnb_url }
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
