package com.clmapp.workerbees.controller;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.clmapp.workerbees.ClaimDemoApplication;
import com.clmapp.workerbees.custrepository.CustRepository;
import com.clmapp.workerbees.model.Customer;


@Controller
public class FileUploadController {
	
	private final Logger log = LoggerFactory.getLogger(this.getClass());
	
	@Autowired
	private CustRepository custRepository;
	  

	@RequestMapping(method = RequestMethod.GET, value = "/listfiles")
	public String provideUploadInfo(Model model) {
		log.debug("GET file upload called");
		File rootFolder = new File(ClaimDemoApplication.ROOT);
		List<String> fileNames = Arrays.stream(rootFolder.listFiles())
			.map(f -> f.getName())
			.collect(Collectors.toList());

		model.addAttribute("files",
			Arrays.stream(rootFolder.listFiles())
					.sorted(Comparator.comparingLong(f -> -1 * f.lastModified()))
					.map(f -> f.getName())
					.collect(Collectors.toList())
		);

		return "home";
	}

	@RequestMapping(method = RequestMethod.POST, value = "/upload")
	public String handleFileUpload(@RequestParam("name") String name,
								   @RequestParam("file") MultipartFile file,
								   RedirectAttributes redirectAttributes) {
		log.debug("File upload invoked");
		if (name.contains("/")) {
			redirectAttributes.addFlashAttribute("message", "Folder separators not allowed");
			return "redirect:/listfiles";
		}
		if (name.contains("/")) {
			redirectAttributes.addFlashAttribute("message", "Relative pathnames not allowed");
			return "redirect:/listfiles";
		}

		if (!file.isEmpty()) {
			try {
				BufferedOutputStream stream = new BufferedOutputStream(
						new FileOutputStream(new File(ClaimDemoApplication.ROOT + "/" + name)));
                FileCopyUtils.copy(file.getInputStream(), stream);
				stream.close();
				redirectAttributes.addFlashAttribute("message",
						"You successfully uploaded " + name + "!");
				log.debug("file uploaded");
				Customer customer = custRepository.findByPolicyNbr(name);
				redirectAttributes.addFlashAttribute("cpolicy", name);
				redirectAttributes.addFlashAttribute("cname", customer.getName());
				redirectAttributes.addFlashAttribute("cseverity", customer.getSeverity());
				redirectAttributes.addFlashAttribute("cexposure", customer.getExposure());
			}
			catch (Exception e) {
				redirectAttributes.addFlashAttribute("message",
						"You failed to upload " + name + " => " + e.getMessage());
			}
		}
		else {
			redirectAttributes.addFlashAttribute("message",
					"You failed to upload " + name + " because the file was empty");
		}

		return "redirect:/listfiles";
	}

}
