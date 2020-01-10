<?php
use Phalcon\Mvc\View;
use Phalcon\Mvc\Controller;
class SettingsController extends ControllerBase
{

    public function initialize(){
        if (!$this->_doesUserHaveToken('User')) {
            $this->_generateToken('User');
        }
    }

    /*--CATEGORY*/
    public function categoryAction()
    {
        $this->view->setRenderLevel(View::LEVEL_ACTION_VIEW);
        $this->view->token = $this->_getToken('User');
    }

    public function getCategoryAction(){
        try{
            $this->view->disable();
            $post = $this->request->getJsonRawBody();

            $info           = [];
            $page           = $post->page;
            $row            = $post->count;
            $search         = $post->search;

            $offset     = ($page - 1) * $row;

            if($search==""){
                $getQry = TblCategory::query()
                    ->limit($row,$offset)
                    ->orderBy("id DESC")
                    ->execute();
            }
            else{
                $getQry = TblCategory::query()
                    ->where("category_name LIKE '%".$search."%'")
                    ->limit($row,$offset)
                    ->orderBy("id DESC")
                    ->execute();
            }


            if($getQry){
                foreach($getQry as $data){
                    $info []  = array(
                        "key"               => $data->id,
                        "category_name"     => $data->category_name,
                        "created_at"        => date("M d, Y",strtotime($data->created_at)),
                        "created_by"        => $this->_getUserInfo($data->created_by),
                    );
                }
            }

            $this->_respond(array(
                'statusCode'        => 200,
                'categoryList'      => $info,
                "page"  => $page,
                "row"  => $row,
                "offset"  => $offset
            ));
        }
        catch(Exception $e){
            $this->_respond(array(
                'statusCode'                =>  500,
                'devMessage'                =>  $e->getMessages()
            ));        
        }
    }

    public function addNewCategoryAction(){
        try{
            $this->view->disable();
            $post = $this->request->getJsonRawBody();
            if(!empty($post)){
                $ins = new TblCategory();
                $ins->category_name  = $post->category_name;
                $ins->created_by     = $post->created_by;
                $ins->created_at     = date("Y-m-d H:i:s");

                if($ins->create()){
                    $this->respond(array(
                        "statusCode"        => 200,
                        "devMessage"        => "Record Saved"
                    ));                
                }
            }

        }
        catch(Exception $e){

        }
    }

    public function deleteSpecificCategoryAction(){
        try{
            $this->view->disable();
            $post = $this->request->getJsonRawBody();

            $del = TblCategory::findFirst("id=$post->key");

            if($del->delete()){
                $this->respond(array(
                    "statusCode"        => 200,
                    "devMessage"        => "Record Deleted"
                ));                
            }
        }
        catch(Exception $e){

        }
    }

    public function updateCategoryAction(){
        try{
            $this->view->disable();
            $post = $this->request->getJsonRawBody();

            $upd = TblCategory::findFirst("id=$post->key");
            $upd->category_name  = $post->category_name;

            if($upd->update()){
                $this->respond(array(
                    "statusCode"        => 200,
                    "devMessage"        => "Record Updated"
                ));                
            }
        }
        catch(Exception $e){

        }
    }

    /*--CATEGORY ENDS HERE*/

    /*--BRAND*/
    public function brandAction()
    {
        $this->view->setRenderLevel(View::LEVEL_ACTION_VIEW);
        $this->view->token = $this->_getToken('User');
    }

    public function addNewBrandAction(){
        try{
            $this->view->disable();
            $post = $this->request->getJsonRawBody();
            if(!empty($post)){
                $ins = new TblBrand();
                $ins->brand_name     = $post->brand_name;
                $ins->created_by     = $post->created_by;
                $ins->created_at     = date("Y-m-d H:i:s");

                if($ins->create()){
                    $this->respond(array(
                        "statusCode"        => 200,
                        "devMessage"        => "Record Saved"
                    ));                
                }
            }

        }
        catch(Exception $e){

        }
    }

    public function getBrandAction(){
        try{
            $this->view->disable();
            $post = $this->request->getJsonRawBody();

            $info           = [];
            $page           = $post->page;
            $row            = $post->count;
            $search         = $post->search;

            $offset     = ($page - 1) * $row;

            if($search==""){
                $getQryTotal = TblBrand::query()
                    ->execute();

                $getQry = TblBrand::query()
                    ->limit($row,$offset)
                    ->orderBy("id DESC")
                    ->execute();
            }
            else{
                $getQryTotal = TblBrand::query()
                    ->where("brand_name LIKE '%".$search."%'")
                    ->execute();

                $getQry = TblBrand::query()
                    ->where("brand_name LIKE '%".$search."%'")
                    ->limit($row,$offset)
                    ->orderBy("id DESC")
                    ->execute();
            }


            if($getQry){
                foreach($getQry as $data){
                    $info []  = array(
                        "key"               => $data->id,
                        "brand_name"        => $data->brand_name,
                        "created_at"        => date("M d, Y",strtotime($data->created_at)),
                        "created_by"        => $this->_getUserInfo($data->created_by),
                    );
                }
            }

            $this->_respond(array(
                'statusCode'        => 200,
                'brandList'         => $info,
                'total'             => $getQryTotal->count()
            ));
        }
        catch(Exception $e){
            $this->_respond(array(
                'statusCode'                =>  500,
                'devMessage'                =>  $e->getMessages()
            ));        
        }
    }

    public function deleteSpecificBrandAction(){
        try{
            $this->view->disable();
            $post = $this->request->getJsonRawBody();

            $del = TblBrand::findFirst("id=$post->key");

            if($del->delete()){
                $this->respond(array(
                    "statusCode"        => 200,
                    "devMessage"        => "Record Deleted"
                ));                
            }
        }
        catch(Exception $e){

        }
    }

    public function updateBrandAction(){
        try{
            $this->view->disable();
            $post = $this->request->getJsonRawBody();

            $upd = TblBrand::findFirst("id=$post->key");
            $upd->brand_name  = $post->brand_name;

            if($upd->update()){
                $this->respond(array(
                    "statusCode"        => 200,
                    "devMessage"        => "Record Updated"
                ));                
            }
        }
        catch(Exception $e){

        }
    }

    /*--BRAND ENDS HERE*/

    /*--CUSTOMER */
    public function customerAction()
    {
        $this->view->setRenderLevel(View::LEVEL_ACTION_VIEW);
        $this->view->token = $this->_getToken('User');
    }

    public function addNewCustomerAction(){
        try{
            $this->view->disable();
            $post = $this->request->getJsonRawBody();
            if(!empty($post)){
                $ins = new TblCustomer();
                $ins->fname     = $post->fname;
                $ins->mname     = $post->mname;
                $ins->lname     = $post->lname;

                $ins->created_by     = $post->created_by;
                $ins->created_at     = date("Y-m-d H:i:s");

                if($ins->create()){
                    $this->respond(array(
                        "statusCode"        => 200,
                        "devMessage"        => "Record Saved"
                    ));                
                }
            }

        }
        catch(Exception $e){

        }
    }

    public function getCustomerAction(){
        try{
            $this->view->disable();
            $post = $this->request->getJsonRawBody();

            $info           = [];
            $page           = $post->page;
            $row            = $post->count;
            $search         = $post->search;

            $offset     = ($page - 1) * $row;

            if($search==""){
                $getQryTotal = TblCustomer::query()
                    ->execute();

                $getQry = TblCustomer::query()
                    ->limit($row,$offset)
                    ->orderBy("id DESC")
                    ->execute();
            }
            else{
                $getQryTotal = TblCustomer::query()
                    ->where("CONCAT(lname,', ',fname,' ',mname) LIKE '%".$search."%'")
                    ->execute();

                $getQry = TblCustomer::query()
                    ->where("CONCAT(lname,', ',fname,' ',mname) LIKE '%".$search."%'")
                    ->limit($row,$offset)
                    ->orderBy("id DESC")
                    ->execute();
            }


            if($getQry){
                foreach($getQry as $data){
                    $info []  = array(
                        "key"               => $data->id,
                        "fname"             => $data->fname,
                        "mname"             => $data->mname,
                        "lname"             => $data->lname,
                        "fullname"          => $data->lname . ", " . $data->fname . " " . $data->mname,
                        "created_at"        => date("M d, Y",strtotime($data->created_at)),
                        "created_by"        => $this->_getUserInfo($data->created_by),
                    );
                }
            }

            $this->_respond(array(
                'statusCode'        => 200,
                'customerList'         => $info,
                'total'             => $getQryTotal->count()
            ));
        }
        catch(Exception $e){
            $this->_respond(array(
                'statusCode'                =>  500,
                'devMessage'                =>  $e->getMessages()
            ));        
        }
    }

    public function deleteSpecificCustomerAction(){
        try{
            $this->view->disable();
            $post = $this->request->getJsonRawBody();

            $del = TblCustomer::findFirst("id=$post->key");

            if($del->delete()){
                $this->respond(array(
                    "statusCode"        => 200,
                    "devMessage"        => "Record Deleted"
                ));                
            }
        }
        catch(Exception $e){

        }
    }

    public function updateCustomerAction(){
        try{
            $this->view->disable();
            $post = $this->request->getJsonRawBody();

            $upd = TblCustomer::findFirst("id=$post->key");
            $upd->fname  = $post->fname;
            $upd->mname  = $post->mname;
            $upd->lname  = $post->lname;

            if($upd->update()){
                $this->respond(array(
                    "statusCode"        => 200,
                    "devMessage"        => "Record Updated"
                ));                
            }
        }
        catch(Exception $e){

        }
    }

    /*--CUSTOMER ENDS HERE*/

    /*--UNIT */

    public function unitAction()
    {
        $this->view->setRenderLevel(View::LEVEL_ACTION_VIEW);
        $this->view->token = $this->_getToken('User');
    }

    public function addNewUnitAction(){
        try{
            $this->view->disable();
            $post = $this->request->getJsonRawBody();
            if(!empty($post)){
                $ins = new TblUnit();
                $ins->unit_name     = $post->unit_name;
                $ins->created_by     = $post->created_by;
                $ins->created_at     = date("Y-m-d H:i:s");

                if($ins->create()){
                    $this->respond(array(
                        "statusCode"        => 200,
                        "devMessage"        => "Record Saved"
                    ));                
                }
            }

        }
        catch(Exception $e){

        }
    }

    public function getUnitAction(){
        try{
            $this->view->disable();
            $post = $this->request->getJsonRawBody();

            $info           = [];
            $page           = $post->page;
            $row            = $post->count;
            $search         = $post->search;

            $offset     = ($page - 1) * $row;

            if($search==""){
                $getQryTotal = TblUnit::query()
                    ->execute();

                $getQry = TblUnit::query()
                    ->limit($row,$offset)
                    ->orderBy("id DESC")
                    ->execute();
            }
            else{
                $getQryTotal = TblUnit::query()
                    ->where("unit_name LIKE '%".$search."%'")
                    ->execute();

                $getQry = TblUnit::query()
                    ->where("unit_name LIKE '%".$search."%'")
                    ->limit($row,$offset)
                    ->orderBy("id DESC")
                    ->execute();
            }


            if($getQry){
                foreach($getQry as $data){
                    $info []  = array(
                        "key"               => $data->id,
                        "unit_name"         => $data->unit_name,
                        "created_at"        => date("M d, Y",strtotime($data->created_at)),
                        "created_by"        => $this->_getUserInfo($data->created_by),
                    );
                }
            }

            $this->_respond(array(
                'statusCode'        => 200,
                'unitList'          => $info,
                'total'             => $getQryTotal->count()
            ));
        }
        catch(Exception $e){
            $this->_respond(array(
                'statusCode'                =>  500,
                'devMessage'                =>  $e->getMessages()
            ));        
        }
    }

    public function deleteSpecificUnitAction(){
        try{
            $this->view->disable();
            $post = $this->request->getJsonRawBody();

            $del = TblUnit::findFirst("id=$post->key");

            if($del->delete()){
                $this->respond(array(
                    "statusCode"        => 200,
                    "devMessage"        => "Record Deleted"
                ));                
            }
        }
        catch(Exception $e){

        }
    }
    
    public function updateUnitAction(){
        try{
            $this->view->disable();
            $post = $this->request->getJsonRawBody();

            $upd = TblUnit::findFirst("id=$post->key");
            $upd->unit_name  = $post->unit_name;


            if($upd->update()){
                $this->respond(array(
                    "statusCode"        => 200,
                    "devMessage"        => "Record Updated"
                ));                
            }
        }
        catch(Exception $e){

        }
    }
}
