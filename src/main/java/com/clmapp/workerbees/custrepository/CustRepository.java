package com.clmapp.workerbees.custrepository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.mongodb.repository.Query;


import java.util.List;

import com.clmapp.workerbees.model.*;
public interface CustRepository extends MongoRepository<Customer, String>{
	
	public List<Customer>findByPostalCode(String postalCode);
	/*    @Query("{ 'postalCode' : ?0 }")
    List<Customer> findCustomersByPostalCode(String postalCode);
    @Query("{ 'postalCode' : ?0 }")
    Customer findCustomerByPolnbr(String postalCode);*/
	public Customer findByPolicyNbr(String policyNbr);
	public List<Customer>findByName(String name);
}
