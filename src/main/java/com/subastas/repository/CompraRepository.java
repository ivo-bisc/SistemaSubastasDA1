package com.subastas.repository;

import com.subastas.model.entity.Compra;
import com.subastas.model.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {

    List<Compra> findByUsuarioOrderByIdDesc(Usuario usuario);

    Optional<Compra> findByIdAndUsuario(Long id, Usuario usuario);
}
