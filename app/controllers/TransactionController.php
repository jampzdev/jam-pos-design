<?php
use Phalcon\Mvc\View;
use Phalcon\Mvc\Controller;
class TransactionController extends ControllerBase
{

    public function initialize(){
        if (!$this->_doesUserHaveToken('User')) {
            $this->_generateToken('User');
        }
    }

    public function posAction(){
        $this->view->setRenderLevel(View::LEVEL_ACTION_VIEW);
        $this->view->token = $this->_getToken('User');
    }


    public function getCustomerListAction(){
        try{
            $this->view->disable();
            $info = [];
            // $post = $this->request->getJsonRawBody();

            $getQry = TblCustomer::query()
                ->execute();

            if($getQry){
                foreach($getQry as $data){
                    $info [] = array(
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

            $this->respond(array(
                "statusCode"        => 200,
                "devMessage"        => $info
            ));        
        }
        catch(Exception $e){

        }
    }

    public function saveToSalesTblAction(){
        try{
            $this->view->disable();
            $post           = $this->request->getJsonRawBody();
            $salesDetails   = $post->salesDetails;

            $ins    = new TblSales();
            $ins->total_price   = $post->total_price;
            $ins->id_customer   = $post->id_customer;
            $ins->created_by    = $post->created_by;
            $ins->created_at    = date("Y-m-d H:i:s");

            if($ins->create()){
                $trans_code = date("Ymd").str_pad($ins->id,10,"0",STR_PAD_LEFT);

                $upd = TblSales::findFirst("id=$ins->id");
                $upd->transaction_code = $trans_code;
                if($upd->update()){
                    for($i=0;$i<count($salesDetails);$i++){
                        $ins2                   = new TblSalesDetails();
                        $ins2->id_sales         = $ins->id;
                        $ins2->id_inventory     = $salesDetails[$i]->key;
                        $ins2->qty              = $salesDetails[$i]->qty;
                        $ins2->price            = $salesDetails[$i]->price;
                        $ins2->total_price      = $salesDetails[$i]->total_price;

                        if($ins2->create()){
                            $this->_deductInInventory($salesDetails[$i]->key,$salesDetails[$i]->qty);
                        }
                    }
                }

                $this->respond(array(
                    "statusCode"        => 200,
                    "devMessage"        => "Transaction Complete"
                ));    
            }
        }
        catch(Exception $e){
            
            $this->respond(array(
                "statusCode"        => 500,
                "devMessage"        => $e
            ));   
        }
    }
}