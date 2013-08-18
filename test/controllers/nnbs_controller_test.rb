require 'test_helper'

class NnbsControllerTest < ActionController::TestCase
  setup do
    @nnb = nnbs(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:nnbs)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create nnb" do
    assert_difference('Nnb.count') do
      post :create, nnb: { appeared: @nnb.appeared, contact: @nnb.contact, content: @nnb.content, date: @nnb.date, type: @nnb.type }
    end

    assert_redirected_to nnb_path(assigns(:nnb))
  end

  test "should show nnb" do
    get :show, id: @nnb
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @nnb
    assert_response :success
  end

  test "should update nnb" do
    patch :update, id: @nnb, nnb: { appeared: @nnb.appeared, contact: @nnb.contact, content: @nnb.content, date: @nnb.date, type: @nnb.type }
    assert_redirected_to nnb_path(assigns(:nnb))
  end

  test "should destroy nnb" do
    assert_difference('Nnb.count', -1) do
      delete :destroy, id: @nnb
    end

    assert_redirected_to nnbs_path
  end
end
