<?php

class TblUnit extends \Phalcon\Mvc\Model
{
    /**
     * Initialize method for model.
     */
    public function initialize()
    {
 
    }

    /**
     * Returns table name mapped in the model.
     *
     * @return string
     */
    public function getSource()
    {
        return 'tbl_unit';
    }

    /**
     * Allows to query a set of records that match the specified conditions
     *
     * @param mixed $parameters
     * @return TblUnit[]
     */
    public static function find($parameters = null)
    {
        return parent::find($parameters);
    }

    /**
     * Allows to query the first record that match the specified conditions
     *
     * @param mixed $parameters
     * @return TblUnit
     */
    public static function findFirst($parameters = null)
    {
        return parent::findFirst($parameters);
    }

}
