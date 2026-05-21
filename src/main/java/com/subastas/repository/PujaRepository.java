package com.subastas.repository;

import com.subastas.model.entity.Item;
import com.subastas.model.entity.Puja;
import com.subastas.model.entity.Subasta;
import com.subastas.model.entity.Usuario;
import com.subastas.model.enums.EstadoPuja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PujaRepository extends JpaRepository<Puja, Long> {

    List<Puja> findBySubastaOrderByTimestampDesc(Subasta subasta);

    List<Puja> findBySubastaAndItemOrderByTimestampDesc(Subasta subasta, Item item);

    List<Puja> findBySubastaAndUsuarioOrderByTimestampDesc(Subasta subasta, Usuario usuario);

    List<Puja> findBySubastaAndItemAndUsuarioOrderByTimestampDesc(Subasta subasta, Item item, Usuario usuario);

    List<Puja> findByUsuarioAndEstado(Usuario usuario, EstadoPuja estado);
}
